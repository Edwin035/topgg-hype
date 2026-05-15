import { Link } from "react-router-dom";
import { User, Package, Lock, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/Auth/AuthProvider";

interface ProfileSidebarProps {
  activePage: "profile" | "orders" | "password";
}

const ProfileSidebar = ({ activePage }: ProfileSidebarProps) => {
  const { logout } = useAuth();

  const menuItems = [
    { id: "profile", label: "Mi Perfil", icon: User, href: "/perfil" },
    {
      id: "orders",
      label: "Historial de Compras",
      icon: Package,
      href: "/historial",
    },
    {
      id: "password",
      label: "Cambiar Contraseña",
      icon: Lock,
      href: "/cambiar-contrasena",
    },
  ];

  return (
    <div className="lg:col-span-1">
      <div className="bg-card border border-border rounded-xl p-3 sm:p-4">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                activePage === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}>
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          ))}

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span>Cerrar Sesión</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default ProfileSidebar;
