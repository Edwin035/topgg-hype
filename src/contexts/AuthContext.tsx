import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ViewMode = "login" | "register" | "recover" | "verify" | "reset";

type AuthDialogContextType = {
  open: boolean;
  view: ViewMode;
  openLogin: (view?: ViewMode) => void;
  closeLogin: () => void;
  setView: (v: ViewMode) => void;
};

const AuthDialogContext = createContext<AuthDialogContextType | null>(null);

const CLOSE_MODALS_EVENT = "app:close-modals";

export function AuthDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<ViewMode>("login");

  const openLogin = useCallback((v: ViewMode = "login") => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(CLOSE_MODALS_EVENT));
    }

    setView(v);
    setOpen(true);
  }, []);

  const closeLogin = useCallback(() => {
    setOpen(false);
    setView("login");
  }, []);

  const value = useMemo(
    () => ({
      open,
      view,
      openLogin,
      closeLogin,
      setView,
    }),
    [open, view, openLogin, closeLogin],
  );

  return (
    <AuthDialogContext.Provider value={value}>
      {children}
    </AuthDialogContext.Provider>
  );
}

export const useAuthDialog = () => {
  const ctx = useContext(AuthDialogContext);

  if (!ctx) {
    throw new Error("useAuthDialog must be used inside AuthDialogProvider");
  }

  return ctx;
};

export const CLOSE_MODALS_EVENT_NAME = CLOSE_MODALS_EVENT;