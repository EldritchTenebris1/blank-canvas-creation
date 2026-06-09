import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Returns a map of user_id -> { name, role } for displaying authors of
// movements, notifications, etc. Available to any authenticated user so the
// "Responsável" column shows real names instead of "Sistema".
export const listSystemUsersFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const [{ data: employees }, { data: allRoles }, { data: profiles }, { data: usersList }] =
      await Promise.all([
        supabaseAdmin.from("employees").select("user_id, name, access_code"),
        supabaseAdmin.from("user_roles").select("user_id, role"),
        supabaseAdmin.from("profiles").select("id, full_name"),
        supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
      ]);

    const empMap = new Map<string, { name: string; code: string }>();
    for (const e of employees ?? []) {
      if (e.user_id) empMap.set(e.user_id, { name: e.name, code: e.access_code ?? "—" });
    }
    const roleMap = new Map<string, string>();
    for (const r of allRoles ?? []) roleMap.set(r.user_id, r.role);
    const profileMap = new Map<string, string>();
    for (const p of profiles ?? []) {
      if (p.id && p.full_name) profileMap.set(p.id, p.full_name);
    }

    const out: Record<string, { name: string; role: string }> = {};
    for (const u of usersList?.users ?? []) {
      const emp = empMap.get(u.id);
      const role = roleMap.get(u.id) ?? "—";
      if (emp) out[u.id] = { name: `${emp.name} (#${emp.code})`, role };
      else if (profileMap.has(u.id)) out[u.id] = { name: profileMap.get(u.id)!, role };
      else out[u.id] = { name: u.email ?? "—", role };
    }
    return out;
  });
