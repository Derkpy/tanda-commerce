import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { t } from "@/shared/lib/i18n";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../model/auth.store";
import { LoginPage } from "./login-page";

vi.mock("../api/auth.api", () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
  },
}));

const mockedAuthApi = vi.mocked(authApi);

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/app" element={<div>Panel autenticado</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ authStatus: "anonymous", user: null });
  });

  it("muestra errores de validacion sin llamar a la API", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole("button", { name: t("auth.login.submit") }));

    expect(
      await screen.findByText(t("auth.login.validation.identifier_required")),
    ).toBeInTheDocument();
    expect(screen.getByText(t("auth.login.validation.password_required"))).toBeInTheDocument();
    expect(mockedAuthApi.login).not.toHaveBeenCalled();
  });

  it("autentica y navega al panel cuando las credenciales son validas", async () => {
    const user = userEvent.setup();
    mockedAuthApi.login.mockResolvedValue({
      email: "derek@example.com",
      idBranch: 1,
      idUser: 7,
      name: "Derek",
      role: "admin",
      status: "active",
      username: "derek",
    });

    renderLogin();

    await user.type(screen.getByLabelText(t("auth.login.identifier_label")), "derek");
    await user.type(screen.getByLabelText(t("auth.login.password_label")), "password123");
    await user.click(screen.getByRole("button", { name: t("auth.login.submit") }));

    await waitFor(() => {
      expect(mockedAuthApi.login).toHaveBeenCalledWith({
        identifier: "derek",
        password: "password123",
      });
    });

    expect(await screen.findByText("Panel autenticado")).toBeInTheDocument();
    expect(useAuthStore.getState().user?.name).toBe("Derek");
  });

  it("muestra error generico de autenticacion", async () => {
    const user = userEvent.setup();
    mockedAuthApi.login.mockRejectedValue({
      isAxiosError: true,
      response: { status: 401 },
    });

    renderLogin();

    await user.type(screen.getByLabelText(t("auth.login.identifier_label")), "derek");
    await user.type(screen.getByLabelText(t("auth.login.password_label")), "password123");
    await user.click(screen.getByRole("button", { name: t("auth.login.submit") }));

    expect(
      await screen.findByText(t("auth.login.errors.invalid_credentials")),
    ).toBeInTheDocument();
    expect(screen.queryByText("Panel autenticado")).not.toBeInTheDocument();
  });

  it("oculta si la cuenta fue bloqueada o quedo inactiva", async () => {
    const user = userEvent.setup();
    mockedAuthApi.login.mockRejectedValue({
      isAxiosError: true,
      response: { status: 403 },
    });

    renderLogin();

    await user.type(screen.getByLabelText(t("auth.login.identifier_label")), "derek");
    await user.type(screen.getByLabelText(t("auth.login.password_label")), "password123");
    await user.click(screen.getByRole("button", { name: t("auth.login.submit") }));

    expect(
      await screen.findByText(t("auth.login.errors.invalid_credentials")),
    ).toBeInTheDocument();
  });
});
