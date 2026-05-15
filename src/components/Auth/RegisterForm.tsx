import React, { useMemo, useState } from "react";
import { Check, Lock, Mail, User, X } from "lucide-react";
import { PasswordInput, Popover, Progress, Text, Box } from "@mantine/core";
import { toast } from "sonner";

import { createUser } from "@/lib/api/users";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function PasswordRequirement({
  meets,
  label,
}: {
  meets: boolean;
  label: string;
}) {
  return (
    <Text
      color={meets ? "teal" : "red"}
      sx={{ display: "flex", alignItems: "center" }}
      mt={7}
      size="sm"
    >
      {meets ? <Check size={14} /> : <X size={14} />}
      <Box ml={10}>{label}</Box>
    </Text>
  );
}

const PW_REQUIREMENTS = [
  { re: /[0-9]/, label: "Incluye número" },
  { re: /[a-z]/, label: "Incluye una minúscula" },
  { re: /[A-Z]/, label: "Incluye una mayúscula" },
  { re: /[$&+,:;=?@#|'<>.^*()%!\-_]/, label: "Incluye símbolo especial" },
];

function getStrength(password: string) {
  let multiplier = password.length >= 8 ? 0 : 1;

  PW_REQUIREMENTS.forEach((r) => {
    if (!r.re.test(password)) multiplier += 1;
  });

  return Math.max(100 - (100 / (PW_REQUIREMENTS.length + 1)) * multiplier, 10);
}

interface RegisterFormProps {
  goLogin: () => void;
}

const RegisterForm = ({ goLogin }: RegisterFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [popoverOpened, setPopoverOpened] = useState(false);
  const [loading, setLoading] = useState(false);

  const [serverMsg, setServerMsg] = useState<string | null>(null);

  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const strength = getStrength(password);
  const color = strength === 100 ? "teal" : strength > 50 ? "yellow" : "red";

  const checks = useMemo(
    () =>
      PW_REQUIREMENTS.map((r, i) => (
        <PasswordRequirement
          key={i}
          label={r.label}
          meets={r.re.test(password)}
        />
      )),
    [password],
  );

  const allPasswordReqs = useMemo(() => {
    return (
      password.length >= 6 && PW_REQUIREMENTS.every((r) => r.re.test(password))
    );
  }, [password]);

  function validateForm() {
    const errors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    let hasError = false;

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      errors.name = "El nombre es obligatorio.";
      hasError = true;
    }

    if (!cleanEmail) {
      errors.email = "El correo es obligatorio.";
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
      errors.email = "El correo no tiene un formato válido.";
      hasError = true;
    }

    if (!password) {
      errors.password = "La contraseña es obligatoria.";
      hasError = true;
    } else if (password.length < 6) {
      errors.password = "La contraseña debe tener mínimo 6 caracteres.";
      hasError = true;
    } else if (!allPasswordReqs) {
      errors.password =
        "La contraseña debe incluir número, mayúscula, minúscula y símbolo.";
      hasError = true;
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirma tu contraseña.";
      hasError = true;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden.";
      hasError = true;
    }

    setFormErrors(errors);
    return !hasError;
  }

  async function handleRegister(evt?: React.FormEvent) {
    evt?.preventDefault();

    setServerMsg(null);

    if (!validateForm()) return;

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    try {
      setLoading(true);

      await createUser({
        name: cleanName,
        email: cleanEmail,
        password,
      });

      toast.success("Cuenta creada correctamente. Ahora inicia sesión.");

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      goLogin();
    } catch (err: any) {
      const msg = err?.message || "No se pudo crear la cuenta.";
      setServerMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleRegister} className="space-y-3 sm:space-y-4">
      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="register-name" className="text-sm">
          Nombre
        </Label>

        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            id="register-name"
            type="text"
            placeholder="Tu nombre"
            className="h-10 pl-10 text-sm sm:h-11"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setFormErrors((prev) => ({ ...prev, name: "" }));
            }}
            autoComplete="name"
          />
        </div>

        {formErrors.name && (
          <p className="text-xs text-red-500">{formErrors.name}</p>
        )}
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="register-email" className="text-sm">
          Correo electrónico
        </Label>

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            id="register-email"
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
        <Label htmlFor="register-password" className="text-sm">
          Contraseña
        </Label>

        <div className="relative">
          <Lock className="absolute left-3 top-[20px] z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Popover
            opened={popoverOpened}
            position="bottom"
            width="target"
            transition="pop"
          >
            <Popover.Target>
              <div
                onFocusCapture={() => setPopoverOpened(true)}
                onBlurCapture={() => setPopoverOpened(false)}
              >
                <PasswordInput
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(evt) => {
                    setPassword(evt.currentTarget.value);
                    setFormErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  radius="sm"
                  styles={{
                    input: {
                      height: 40,
                      background: "hsl(var(--background))",
                      borderRadius: "0.675rem",
                      color: "hsl(var(--foreground))",
                      paddingLeft: "2.5rem",
                      fontSize: "0.875rem",
                      border: "1px solid hsl(var(--input))",
                    },
                    innerInput: {
                      color: "hsl(var(--foreground))",
                    },
                  }}
                />
              </div>
            </Popover.Target>

            <Popover.Dropdown>
              <Progress
                color={color}
                value={strength}
                size={5}
                style={{ marginBottom: 10 }}
              />

              <PasswordRequirement
                label="Mínimo 6 caracteres"
                meets={password.length >= 6}
              />

              {checks}
            </Popover.Dropdown>
          </Popover>
        </div>

        {formErrors.password && (
          <p className="text-xs text-red-500">{formErrors.password}</p>
        )}
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="register-confirm" className="text-sm">
          Confirmar contraseña
        </Label>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            id="register-confirm"
            type="password"
            placeholder="••••••••"
            className="h-10 pl-10 text-sm sm:h-11"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setFormErrors((prev) => ({ ...prev, confirmPassword: "" }));
            }}
            autoComplete="new-password"
          />
        </div>

        {formErrors.confirmPassword && (
          <p className="text-xs text-red-500">{formErrors.confirmPassword}</p>
        )}
      </div>

      {serverMsg && (
        <div className="text-center text-sm text-red-300">{serverMsg}</div>
      )}

      <Button
        type="submit"
        className="h-10 w-full text-sm sm:h-11"
        disabled={loading}
      >
        {loading ? "Creando cuenta..." : "Crear cuenta"}
      </Button>

      <p className="text-center text-xs text-muted-foreground sm:text-sm">
        ¿Ya tienes cuenta?{" "}
        <button
          type="button"
          onClick={goLogin}
          className="font-medium text-primary hover:underline"
        >
          Inicia sesión
        </button>
      </p>
    </form>
  );
};

export default RegisterForm;