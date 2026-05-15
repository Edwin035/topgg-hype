import { useState } from "react";
import { Lock, Save } from "lucide-react";
import { toast } from "sonner";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import { useAuth } from "@/components/Auth/AuthProvider";
import { changePassword } from "@/lib/api/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ChangePasswordPage = () => {
  const { user, initializing, logout } = useAuth();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const passwordError =
    newPassword.length > 0 && newPassword.length < 6
      ? "La contraseña debe tener mínimo 6 caracteres."
      : "";

  const confirmError =
    confirmPassword.length > 0 && newPassword !== confirmPassword
      ? "Las contraseñas no coinciden."
      : "";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      toast.error("Debes iniciar sesión.");
      return;
    }

    if (!newPassword.trim()) {
      toast.error("Ingresa la nueva contraseña.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("La contraseña debe tener mínimo 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    try {
      setSaving(true);

      await changePassword({
        userId: user.id,
        password: newPassword,
      });

      toast.success("Contraseña actualizada. Inicia sesión nuevamente.");

      logout();
    } catch (err: any) {
      toast.error(err?.message || "No se pudo cambiar la contraseña.");
    } finally {
      setSaving(false);
    }
  }

  if (initializing) {
    return (
      <div className="min-h-screen bg-background text-white">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          Cargando…
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-white">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          Debes iniciar sesión para cambiar tu contraseña.
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold font-display sm:text-3xl">
          Cambiar <span className="gradient-text">Contraseña</span>
        </h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <ProfileSidebar activePage="password" />

          <div className="lg:col-span-3">
            <form
              onSubmit={onSubmit}
              className="space-y-6 rounded-xl border border-border bg-card p-4 sm:p-6"
            >
              <h2 className="flex items-center gap-2 text-lg font-semibold sm:text-xl">
                <Lock className="h-5 w-5 text-primary" />
                Seguridad de la cuenta
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nueva contraseña</Label>

                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />

                  {passwordError && (
                    <p className="text-xs text-red-400">{passwordError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Confirmar contraseña</Label>

                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />

                  {confirmError && (
                    <p className="text-xs text-red-400">{confirmError}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={
                  saving ||
                  !newPassword ||
                  !confirmPassword ||
                  !!passwordError ||
                  !!confirmError
                }
                className="flex h-10 w-full items-center gap-2 sm:w-auto"
              >
                <Save className="h-4 w-4" />
                {saving ? "Guardando..." : "Cambiar contraseña"}
              </Button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ChangePasswordPage;