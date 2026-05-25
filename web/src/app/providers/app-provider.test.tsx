import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authApi } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/features/auth/model/auth.store";
import { AppProvider } from "./app-provider";

vi.mock("@/features/auth/api/auth.api", () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
  },
}));

const mockedAuthApi = vi.mocked(authApi);

describe("AppProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ authStatus: "idle", user: null });
  });

  it("rehidrata la sesion cuando /auth/me responde usuario", async () => {
    mockedAuthApi.me.mockResolvedValue({
      email: "derek@example.com",
      idBranch: 4,
      idUser: 9,
      name: "Derek",
      role: "admin",
      status: "active",
      username: "derkpy",
    });

    render(
      <AppProvider>
        <div>app</div>
      </AppProvider>,
    );

    await waitFor(() => {
      expect(useAuthStore.getState().authStatus).toBe("authenticated");
    });

    expect(useAuthStore.getState().user?.idUser).toBe(9);
  });

  it("deja la sesion anonima cuando /auth/me falla", async () => {
    mockedAuthApi.me.mockRejectedValue(new Error("Unauthorized"));

    render(
      <AppProvider>
        <div>app</div>
      </AppProvider>,
    );

    await waitFor(() => {
      expect(useAuthStore.getState().authStatus).toBe("anonymous");
    });

    expect(useAuthStore.getState().user).toBeNull();
  });
});
