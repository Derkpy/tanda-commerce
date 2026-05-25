import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/model/auth.store";

function FullPageLoader() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="rounded-lg border border-neutral-200 bg-white px-5 py-4 text-sm font-medium text-neutral-700 shadow-sm">
        Cargando sesion
      </div>
    </main>
  );
}

export function RequireAuth() {
  const location = useLocation();
  const authStatus = useAuthStore((state) => state.authStatus);
  const user = useAuthStore((state) => state.user);

  if (authStatus === "idle" || authStatus === "checking") {
    return <FullPageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function RedirectWhenAuthenticated() {
  const authStatus = useAuthStore((state) => state.authStatus);
  const user = useAuthStore((state) => state.user);

  if (authStatus === "idle" || authStatus === "checking") {
    return <FullPageLoader />;
  }

  if (user) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
