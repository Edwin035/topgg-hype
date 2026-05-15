import React from "react";
import { Link } from "react-router-dom";

const OAuthSuccess: React.FC = () => {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-white">
      <p>OAuth con Google todavía no está disponible en el backend.</p>

      <Link className="text-primary hover:underline" to="/">
        Volver al inicio
      </Link>
    </div>
  );
};

export default OAuthSuccess;