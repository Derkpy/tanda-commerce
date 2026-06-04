import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "@/app/layout/dashboard-layout";
import { ProtectedAppPage } from "@/features/auth/view/protected-app-page";
import { LoginPage } from "@/features/auth/view/login-page";
import { ClientsPage } from "@/features/clients/view/clients-page";
import { ProductsInventoryPage } from "@/features/products/view/products-inventory-page";
import { CreateTandaPage } from "@/features/tandas/view/create-tanda-page";
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
          <Route element={<DashboardLayout />}>
            <Route path="/app" element={<ProtectedAppPage />} />
            <Route path="/app/clients" element={<ClientsPage />} />
            <Route path="/app/tanda" element={<CreateTandaPage />} />
            <Route path="/app/products" element={<ProductsInventoryPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
