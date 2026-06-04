import { isAxiosError } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { t } from "@/shared/lib/i18n";
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
      return t("auth.login.errors.invalid_credentials");
    }

    if (error.response?.status === 429) {
      return t("auth.login.errors.too_many_attempts");
    }
  }

  return t("auth.login.errors.generic");
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
