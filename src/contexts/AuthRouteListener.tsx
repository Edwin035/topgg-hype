import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthDialog } from "./AuthContext";

type LocationState = {
  openLogin?: boolean;
  from?: Location;
};

export default function AuthRouteListener() {
  const location = useLocation();
  const navigate = useNavigate();
  const { openLogin } = useAuthDialog();

  useEffect(() => {
    const state = location.state as LocationState | null;

    if (location.pathname === "/login") {
      openLogin("login");

      navigate("/", {
        replace: true,
        state: null,
      });

      return;
    }

    if (location.pathname === "/" && state?.openLogin) {
      openLogin("login");

      navigate("/", {
        replace: true,
        state: null,
      });
    }
  }, [location.pathname, location.state, openLogin, navigate]);

  return null;
}