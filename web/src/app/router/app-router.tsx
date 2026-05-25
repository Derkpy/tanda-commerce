import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedAppPage } from "@/features/auth/view/protected-app-page";
import { LoginPage } from "@/features/auth/view/login-page";
import { RedirectWhenAuthenticated, RequireAuth } from "./route-guards";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/app" replace />} />

        <Route element={<RedirectWhenAuthenticated />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route path="/app" element={<ProtectedAppPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
