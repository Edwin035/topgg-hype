import { Button } from "@/components/ui/button";

interface RecoverFormProps {
  goLogin: () => void;
}

const RecoverForm = ({ goLogin }: RecoverFormProps) => {
  return (
    <div className="space-y-4 p-2">
      <p className="text-sm text-muted-foreground">
        La recuperación de contraseña todavía no está disponible en el backend.
      </p>

      <p className="text-xs text-muted-foreground">
        Para activarla necesitas crear endpoints como:
        <br />
        <span className="text-primary">POST /api/auth/request-password-reset</span>
        <br />
        <span className="text-primary">POST /api/auth/reset-password</span>
      </p>

      <Button type="button" className="w-full" onClick={goLogin}>
        Volver a iniciar sesión
      </Button>
    </div>
  );
};

export default RecoverForm;