import type { ReactNode } from "react";
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "@/components/Auth/AuthProvider";
import { useAuthDialog } from "@/contexts/AuthContext";

type RequireAuthProps = {
  children: ReactNode;
};

export function RequireAuth({ children }: RequireAuthProps) {
  const { user, initializing } = useAuth();
  const { openLogin } = useAuthDialog();
  const location = useLocation();

  useEffect(() => {
    if (!initializing && !user) {
      openLogin("login");
    }
  }, [initializing, user, openLogin]);

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-white">
        Validando sesión…
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          from: location,
          openLogin: true,
        }}
      />
    );
  }

  return <>{children}</>;
}