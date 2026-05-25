import { LogOut } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useLogoutController } from "../controller/use-logout-controller";
import { useAuthStore } from "../model/auth.store";

export function ProtectedAppPage() {
  const user = useAuthStore((state) => state.user);
  const { isLoggingOut, logout } = useLogoutController();

  return (
    <main className="min-h-screen bg-[#f5f7f8] text-neutral-950">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              System Tandas
            </p>
            <h1 className="text-2xl font-semibold">Panel operativo</h1>
          </div>

          <Button
            disabled={isLoggingOut}
            onClick={logout}
            type="button"
            variant="secondary"
          >
            <LogOut aria-hidden="true" className="size-4" />
            {isLoggingOut ? "Cerrando" : "Cerrar sesion"}
          </Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_0.72fr]">
        <article className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-neutral-500">Sesion activa</p>
          <h2 className="mt-2 text-xl font-semibold">{user?.name ?? "Usuario"}</h2>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-neutral-500">Rol</dt>
              <dd className="mt-1 font-medium">{user?.role ?? "Sin rol"}</dd>
            </div>
            <div>
              <dt className="text-sm text-neutral-500">Estado</dt>
              <dd className="mt-1 font-medium">{user?.status ?? "Activo"}</dd>
            </div>
            <div>
              <dt className="text-sm text-neutral-500">Correo</dt>
              <dd className="mt-1 break-words font-medium">
                {user?.email ?? "Sin correo"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-neutral-500">Sucursal</dt>
              <dd className="mt-1 font-medium">
                {user?.branch?.name ?? user?.idBranch ?? "Sin sucursal"}
              </dd>
            </div>
          </dl>
        </article>

        <aside className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-neutral-500">Acceso</p>
          <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
            Autenticado con sesion del servidor.
          </div>
        </aside>
      </section>
    </main>
  );
}
