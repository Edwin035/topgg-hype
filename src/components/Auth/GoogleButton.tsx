// src/features/auth/GoogleButton.tsx
// @fileoverview Botón de inicio de sesión con Google para Legends Store.
// Redirige al usuario al endpoint de Google OAuth y maneja estado de redirección.
import React, { useState } from "react";
// Componente que renderiza el ícono oficial de Google con SVG.
function GoogleIcon() {
  return (
    <svg
      className="h-6 w-6 mr-2 drop-shadow-md"
      viewBox="0 0 48 48"
      aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.9 32.4 29.4 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C33.6 5.7 29 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.5 16.4 18.9 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C33.6 5.7 29 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.2C29.4 36 26.9 37 24 37c-5.3 0-9.8-3.6-11.3-8.5l-6.6 5.1C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.7 5.8-7.1 6.9l6.3 5.2C37.5 38.8 40 34 40 28c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}

// ✅ Nuevo origen de constantes (módulo http)
// Importa constantes de configuración: URL base de la API y slug del tenant.
import { API_URL, TENANT_SLUG } from "../../lib/api/http";
import { Button } from "../ui/button";
// Componente botón que inicia el flujo de login con Google OAuth.
const GoogleButton: React.FC = ({ label }: { label: string }) => {
  // Estado que indica si la redirección a Google OAuth está en curso para deshabilitar el botón.
  const [redirecting, setRedirecting] = useState(false);
  // Función que construye la URL de OAuth de Google y redirige al usuario.
  const handleGoogleLogin = () => {
    const tenant = TENANT_SLUG || "legendsstore";
    // Volver a la misma página después del login (el back agregará ?token=...)
    const returnTo = window.location.href;

    const url =
      `${API_URL}/auth/google` +
      `?tenantSlug=${encodeURIComponent(tenant)}` +
      `&returnTo=${encodeURIComponent(returnTo)}`;
    // Marca el botón como "redirecting" y realiza la redirección al endpoint de Google OAuth.
    setRedirecting(true);
    window.location.href = url;
  };

  return (
    <Button
      onClick={handleGoogleLogin}
      disabled={redirecting}
      type="button"
      variant="outline"
      className="w-full gap-2 py-6"
      aria-busy={redirecting}
      data-testid="google-oauth-btn">
      <GoogleIcon />
      <span>Continuar con Google</span>
    </Button>
  );
};

export default GoogleButton;
