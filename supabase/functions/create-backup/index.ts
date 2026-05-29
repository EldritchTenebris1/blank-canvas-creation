import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user info from JWT to verify email
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) throw new Error("Invalid user");
    if (user.email !== "eldritch.tenebris1@gmail.com") {
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
      created_by: user.id,
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
