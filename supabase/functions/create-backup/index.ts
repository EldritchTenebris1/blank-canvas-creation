import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const MASTER_ADMIN_EMAIL = "eldritch.tenebris1@gmail.com";

function readJwtPayload(accessToken: string) {
  const [, payload] = accessToken.split(".");
  if (!payload) return null;

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return JSON.parse(atob(padded)) as { sub?: string; email?: string; exp?: number };
  } catch (error) {
    console.error("Backup JWT payload parse failed:", error);
    return null;
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Service-role client for privileged data access (bypasses RLS)
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user info from the incoming JWT to verify email.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accessToken = authHeader.replace(/^Bearer\s+/i, "").trim();

    const jwtPayload = readJwtPayload(accessToken);
    if (!jwtPayload?.sub || !jwtPayload.email || (jwtPayload.exp && jwtPayload.exp * 1000 < Date.now())) {
      console.error("Backup JWT validation failed: missing claims or expired token");
      return new Response(JSON.stringify({ error: "Invalid user" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (jwtPayload.email !== MASTER_ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tables = ["products", "movements", "categories", "app_settings", "employees", "profiles"];
    const backupData: Record<string, any> = {};

    for (const table of tables) {
      const { data, error } = await supabaseClient.from(table).select("*");
      if (error) console.error(`Error fetching ${table}:`, error);
      backupData[table] = data ?? [];
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `backup_${timestamp}.json`;
    const fileContent = JSON.stringify(backupData, null, 2);
    const fileSize = new TextEncoder().encode(fileContent).length;

    // Upload to storage
    const { error: uploadError } = await supabaseClient.storage
      .from("backups")
      .upload(fileName, fileContent, {
        contentType: "application/json",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Record in database
    const { error: dbError } = await supabaseClient.from("backups").insert({
      name: fileName,
      file_path: fileName,
      size_bytes: fileSize,
      created_by: jwtPayload.sub,
    });

    if (dbError) throw dbError;

    return new Response(JSON.stringify({ message: "Backup created successfully", fileName }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
