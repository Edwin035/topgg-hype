import { LogOut, User as UserIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/components/Auth/AuthProvider";
import { useAuthDialog } from "@/contexts/AuthContext";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const UserMenu = () => {
  const { user, logout } = useAuth();
  const { openLogin } = useAuthDialog();

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada.");
  };

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => openLogin?.()}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors hover:text-primary"
      >
        <UserIcon className="h-5 w-5" />
        <span className="hidden sm:inline">Ingresar</span>
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors hover:text-primary"
        >
          <UserIcon className="h-5 w-5" />
          <span className="hidden max-w-[140px] truncate sm:inline">
            {user.name || user.email}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link to="/perfil">Mi cuenta</Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="text-red-500 focus:text-red-500"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;