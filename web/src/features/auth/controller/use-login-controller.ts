import { isAxiosError } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { createZodResolver } from "@/shared/lib/zod-form-resolver";
import { authApi } from "../api/auth.api";
import { loginSchema, type LoginValues } from "../model/auth.schema";
import { useAuthStore } from "../model/auth.store";

type RedirectState = {
  from?: {
    pathname?: string;
  };
};

function getRedirectPath(state: unknown) {
  const from = (state as RedirectState | null)?.from?.pathname;

  if (!from || !from.startsWith("/") || from === "/login") {
    return "/app";
  }

  return from;
}

function getLoginErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      return "No se pudo iniciar sesion con esas credenciales.";
    }

    if (error.response?.status === 429) {
      return "Demasiados intentos. Intenta de nuevo mas tarde.";
    }
  }

  return "No se pudo iniciar sesion. Intenta de nuevo.";
}

export function useLoginController() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const form = useForm<LoginValues>({
    defaultValues: {
      identifier: "",
      password: "",
    },
    mode: "onSubmit",
    resolver: createZodResolver(loginSchema),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null);

    try {
      const user = await authApi.login(values);
      setAuthenticated(user);
      navigate(getRedirectPath(location.state), { replace: true });
    } catch (error) {
      setServerError(getLoginErrorMessage(error));
    }
  });

  return {
    form,
    isPasswordVisible,
    onSubmit,
    serverError,
    togglePasswordVisibility: () => setIsPasswordVisible((value) => !value),
  };
}
