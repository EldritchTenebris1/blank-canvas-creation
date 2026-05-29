import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { AdminShell } from "@/components/buriti/AdminShell";
import { BuritiLogo } from "@/components/buriti/Logo";

export const Route = createFileRoute("/_authenticated")({
  component: AuthedLayout,
});

function AuthedLayout() {
  const { loading, session, role } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (loading) return;
    if (!session) navigate({ to: "/admin", replace: true });
    else if (role === "frentista") navigate({ to: "/operador", replace: true });
  }, [loading, session, role, navigate]);

  if (loading || !session || role !== "admin") {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="flex flex-col items-center gap-4">
          <BuritiLogo size="lg" />
          <div className="h-1 w-32 overflow-hidden rounded-full bg-card">
            <div className="h-full w-1/2 shimmer" />
          </div>
        </div>
      </div>
    );
  }
  return <AdminShell />;
}