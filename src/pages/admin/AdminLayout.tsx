import { NavLink, Outlet } from "react-router-dom";
import {
  AlertTriangle,
  LayoutDashboard,
  ListOrdered,
  ShieldCheck,
  Store,
} from "lucide-react";

import { useAuth } from "@/components/Auth/AuthProvider";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin", end: true, label: "Overview", icon: LayoutDashboard },
  { to: "/admin/ventas", end: false, label: "Ventas", icon: ListOrdered },
  {
    to: "/admin/atencion",
    end: false,
    label: "Requiere atención",
    icon: AlertTriangle,
  },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )
            }>
            <Icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        );
      })}
    </>
  );
}

const AdminLayout = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-[1400px] flex-col lg:flex-row">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-64 shrink-0 border-r border-border p-4 lg:flex lg:min-h-screen lg:flex-col">
          <div className="mb-6 flex items-center gap-2 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <ShieldCheck className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">Panel</p>
              <p className="text-xs text-muted-foreground leading-tight">
                Gestión de ventas
              </p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1">
            <NavItems />
          </nav>

          <div className="mt-4 border-t border-border pt-4">
            {user ? (
              <div className="mb-3 px-2">
                <p className="truncate text-sm font-medium">
                  {user.name || user.email}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            ) : null}
            <NavLink
              to="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <Store className="h-4 w-4" />
              Volver a la tienda
            </NavLink>
          </div>
        </aside>

        {/* Top bar (mobile) */}
        <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-sm font-bold">Panel de gestión</span>
            </div>
            <NavLink
              to="/"
              className="text-xs text-muted-foreground hover:text-foreground">
              Tienda
            </NavLink>
          </div>
          <nav className="flex gap-2 overflow-x-auto">
            <NavItems />
          </nav>
        </header>

        {/* Contenido */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
