import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { loginClient } from "@/lib/api/auth";
import { useAuth } from "./AuthProvider";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginFormProps {
  goRegister: () => void;
  goRecover: () => void;
  closeLogin: () => void;
}

const LoginForm = ({ goRegister, goRecover, closeLogin }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { user, initializing, setToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!initializing && user) {
      navigate("/", { replace: true });
    }
  }, [user, initializing, navigate]);

  async function handleLogin(evt?: React.FormEvent) {
    evt?.preventDefault();

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const errors = {
      email: "",
      password: "",
    };

    let hasError = false;

    if (!cleanEmail) {
      errors.email = "El correo es obligatorio.";
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
      errors.email = "El correo no tiene un formato válido.";
      hasError = true;
    }

    if (!cleanPassword) {
      errors.password = "La contraseña es obligatoria.";
      hasError = true;
    }

    setFormErrors(errors);

    if (hasError) return;

    try {
      setLoading(true);

      const res = await loginClient({
        email: cleanEmail,
        password: cleanPassword,
      });

      await setToken(res.accessToken);

      toast.success("Sesión iniciada correctamente.");
      closeLogin();
      navigate("/", { replace: true });
    } catch (err: any) {
      const msg = err?.message || "Credenciales inválidas.";
      setFormErrors((prev) => ({ ...prev, password: msg }));
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="login-email" className="text-sm">
          Correo electrónico
        </Label>

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            id="login-email"
            type="email"
            placeholder="tu@email.com"
            className="h-10 pl-10 text-sm sm:h-11"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFormErrors((prev) => ({ ...prev, email: "" }));
            }}
            autoComplete="email"
          />
        </div>

        {formErrors.email && (
          <p className="text-xs text-red-500">{formErrors.email}</p>
        )}
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="login-password" className="text-sm">
          Contraseña
        </Label>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="h-10 pl-10 pr-10 text-sm sm:h-11"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFormErrors((prev) => ({ ...prev, password: "" }));
            }}
            autoComplete="current-password"
          />

          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {formErrors.password && (
          <p className="text-xs text-red-500">{formErrors.password}</p>
        )}
      </div>

      <button
        type="button"
        onClick={goRecover}
        className="text-xs text-primary hover:underline sm:text-sm"
      >
        ¿Olvidaste tu contraseña?
      </button>

      <Button
        type="submit"
        className="h-10 w-full text-sm sm:h-11"
        disabled={loading}
      >
        {loading ? "Iniciando sesión..." : "Iniciar sesión"}
      </Button>

      <p className="text-center text-xs text-muted-foreground sm:text-sm">
        ¿No tienes cuenta?{" "}
        <button
          type="button"
          onClick={goRegister}
          className="font-medium text-primary hover:underline"
        >
          Regístrate
        </button>
      </p>
    </form>
  );
};

export default LoginForm;