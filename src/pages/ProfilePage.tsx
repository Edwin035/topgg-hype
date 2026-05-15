import React, { useEffect, useState } from "react";
import { Mail, Save, User, UserIcon } from "lucide-react";
import { toast } from "sonner";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/profile/ProfileSidebar";

import { useAuth } from "@/components/Auth/AuthProvider";
import { updateUser } from "@/lib/api/users";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BaseInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode;
  error?: string | null;
  helper?: string | null;
};

const BaseInput = React.forwardRef<HTMLInputElement, BaseInputProps>(
  ({ icon, error, helper, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-600">
              {icon}
            </span>
          )}

          <Input
            ref={ref}
            className={`h-10 pl-10 text-sm ${className}`}
            {...props}
          />
        </div>

        <div className="mt-1 h-5">
          {error ? (
            <p className="text-xs leading-5 text-red-300">* {error}</p>
          ) : helper ? (
            <p className="text-xs leading-5 text-white/70">{helper}</p>
          ) : null}
        </div>
      </div>
    );
  },
);

BaseInput.displayName = "BaseInput";

const ProfilePage = () => {
  const { user, initializing, refresh } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  const [initialName, setInitialName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    setForm({
      name: user.name ?? "",
      email: user.email ?? "",
    });

    setInitialName(user.name ?? "");
  }, [user]);

  const cleanName = form.name.trim();
  const nameChanged = cleanName !== initialName;

  const nameError =
    cleanName.length > 0 && cleanName.length < 3
      ? "Mínimo 3 caracteres."
      : "";

  async function onSaveProfile() {
    if (!user) return;

    if (!nameChanged) {
      toast.info("No hay cambios para guardar.");
      return;
    }

    if (nameError) {
      toast.error(nameError);
      return;
    }

    try {
      setSaving(true);

      await updateUser(user.id, {
        name: cleanName,
      });

      await refresh();

      setInitialName(cleanName);
      toast.success("Perfil actualizado correctamente.");
    } catch (err: any) {
      toast.error(err?.message || "No se pudo actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  }

  if (initializing) {
    return (
      <div className="min-h-screen bg-background text-white">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          Cargando perfil…
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
          Debes iniciar sesión para ver tu perfil.
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
          Mi <span className="gradient-text">Cuenta</span>
        </h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <ProfileSidebar activePage="profile" />

          <div className="lg:col-span-3">
            <div className="space-y-6 rounded-xl border border-border bg-card p-4 sm:p-6">
              <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold sm:text-xl">
                <User className="h-5 w-5 text-primary" />
                Información <span className="gradient-text">Personal</span>
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm">Nombre</Label>

                  <BaseInput
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    icon={<UserIcon size={16} />}
                    error={nameError}
                    helper="Mínimo 3 caracteres."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">
                    Correo electrónico
                  </Label>

                  <BaseInput
                    value={form.email}
                    readOnly
                    icon={<Mail size={16} />}
                    className="cursor-not-allowed opacity-80"
                    helper="El correo no se puede cambiar desde este formulario."
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={onSaveProfile}
                  className="flex h-10 w-full items-center gap-2 sm:w-auto"
                  disabled={saving || !nameChanged || !!nameError}
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;