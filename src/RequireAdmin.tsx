import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "@/components/Auth/AuthProvider";

type RequireAdminProps = {
  children: ReactNode;
};

/**
 * Protege el dashboard: exige sesión y rol ADMIN. Si no hay sesión, manda al
 * inicio pidiendo login; si hay sesión pero no es ADMIN, redirige al inicio.
 */
export function RequireAdmin({ children }: RequireAdminProps) {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-white">
        Validando sesión…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace state={{ openLogin: true }} />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
