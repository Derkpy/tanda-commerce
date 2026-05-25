import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../model/auth.store";

export function useLogoutController() {
  const navigate = useNavigate();
  const setAnonymous = useAuthStore((state) => state.setAnonymous);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);

    try {
      await authApi.logout();
    } finally {
      setAnonymous();
      setIsLoggingOut(false);
      navigate("/login", { replace: true });
    }
  };

  return { isLoggingOut, logout };
}
