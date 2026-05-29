import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const codeRegex = /^\d{1,3}$/;
const pinRegex = /^\d{2,4}$/;

export const createEmployeeFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        name: z.string().min(2).max(80),
        access_code: z.string().regex(codeRegex, "Código deve ter 1-3 dígitos"),
        pin: z.string().regex(pinRegex, "Senha deve ter 2-4 dígitos"),
        monthly_goal: z.number().min(0).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    // Verify caller is admin
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin");
    if (!roles || roles.length === 0) {
      throw new Error("Apenas administradores podem criar frentistas.");
    }

    const code = data.access_code.padStart(2, "0");
    const email = `f${code}@buriti.local`;

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.pin,
      email_confirm: true,
      user_metadata: { name: data.name, access_code: code },
    });
    if (error || !created.user) throw new Error(error?.message ?? "Falha ao criar usuário");

    const newUserId = created.user.id;

    const { error: empErr } = await supabaseAdmin.from("employees").insert({
      user_id: newUserId,
      access_code: code,
      name: data.name,
      active: true,
      monthly_goal: data.monthly_goal ?? 0,
    });
    if (empErr) {
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      throw new Error(empErr.message);
    }

    // Remove any auto-assigned admin role (if first user trigger fired) and assign frentista
    await supabaseAdmin.from("user_roles").delete().eq("user_id", newUserId);
    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: newUserId, role: "frentista" });
    if (roleErr) throw new Error(roleErr.message);

    return { id: newUserId, access_code: code, name: data.name };
  });

export const deleteEmployeeFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin");
    if (!roles || roles.length === 0) throw new Error("Sem permissão.");

    const { data: emp } = await supabaseAdmin
      .from("employees")
      .select("user_id")
      .eq("id", data.id)
      .maybeSingle();
    if (emp?.user_id) {
      await supabaseAdmin.auth.admin.deleteUser(emp.user_id);
    } else {
      await supabaseAdmin.from("employees").delete().eq("id", data.id);
    }
    return { ok: true };
  });

export const updateEmployeeGoalFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), goal: z.number().min(0) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin");
    if (!roles || roles.length === 0) throw new Error("Sem permissão.");
    await supabaseAdmin
      .from("employees")
      .update({ monthly_goal: data.goal })
      .eq("id", data.id);
    return { ok: true };
  });

export const toggleEmployeeFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), active: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin");
    if (!roles || roles.length === 0) throw new Error("Sem permissão.");
    await supabaseAdmin
      .from("employees")
      .update({ active: data.active })
      .eq("id", data.id);
    return { ok: true };
  });