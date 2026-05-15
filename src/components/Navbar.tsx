import { Search, Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import SearchDialog from "@/components/SearchDialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import UserMenu from "@/components/UserMenu";
import { useAuth } from "@/components/Auth/AuthProvider";
import { toast } from "sonner";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { user, logout } = useAuth();

  const navItems = [
    { name: "Catalogo", href: "/catalogo" },
    { name: "Aliados", href: "/aliados" },
  ];

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    toast.success("Sesión cerrada.");
  };

  return (
    <>
      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex shrink-0 items-center gap-2">
              <img
                src="https://imagedelivery.net/mdYNjHMfu0qYk6YLCukv2Q/07bccdde-7b1c-4dc0-e236-3a9f7b055f00/public"
                alt="TopLevel"
                loading="eager"
                className="h-10 w-auto max-w-[160px] select-none object-contain md:h-11 md:max-w-[190px] lg:h-12"
              />
            </Link>

            <div className="hidden items-center gap-6 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-sm font-medium text-white transition-colors duration-300 hover:text-primary"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-white transition-colors hover:text-primary"
                aria-label="Buscar"
              >
                <Search className="h-5 w-5" />
              </button>

              <UserMenu />

              <button
                className="p-2 text-white md:hidden"
                onClick={() => setIsMenuOpen(true)}
                aria-label="Menú"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <Dialog open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DialogContent className="bg-card border-border p-0 sm:max-w-sm">
          <div className="flex items-center justify-between border-b border-border p-4">
            <Link to="/" onClick={() => setIsMenuOpen(false)}>
              <img
                src="https://imagedelivery.net/mdYNjHMfu0qYk6YLCukv2Q/07bccdde-7b1c-4dc0-e236-3a9f7b055f00/public"
                alt="TopLevel"
                className="h-8 w-auto object-contain"
              />
            </Link>

            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
              >
                <LogOut className="h-5 w-5" />
                Cerrar sesión
              </button>
            )}
          </div>

          <nav className="flex flex-col gap-1 p-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="rounded-lg px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;