import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useAuth } from "@/lib/auth";
import { BuritiLogo } from "@/components/buriti/Logo";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { loading, session, role } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate({ to: "/login", replace: true });
    } else if (role === "frentista") {
      navigate({ to: "/operador", replace: true });
    } else {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [loading, session, role, navigate]);

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