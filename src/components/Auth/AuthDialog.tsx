import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useAuthDialog } from "@/contexts/AuthContext";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import RecoverForm from "./RecoverForm";

const AuthDialog = () => {
  const { open, closeLogin, view, setView } = useAuthDialog();

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          closeLogin();
        }
      }}
    >
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-center text-lg sm:text-xl font-display">
            {view === "login" && "Iniciar sesión"}
            {view === "register" && "Crear cuenta"}
            {view === "recover" && "Recuperar contraseña"}
          </DialogTitle>
        </DialogHeader>

        {view === "login" && (
          <LoginForm
            goRegister={() => setView("register")}
            goRecover={() => setView("recover")}
            closeLogin={closeLogin}
          />
        )}

        {view === "register" && (
          <RegisterForm goLogin={() => setView("login")} />
        )}

        {view === "recover" && <RecoverForm goLogin={() => setView("login")} />}
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;