import { Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import { Alert } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useLoginController } from "../controller/use-login-controller";

export function LoginPage() {
  const {
    form: {
      formState: { errors, isSubmitting },
      register,
    },
    isPasswordVisible,
    onSubmit,
    serverError,
    togglePasswordVisibility,
  } = useLoginController();

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f7f8] px-4 py-10 text-neutral-950">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm md:grid-cols-[0.92fr_1.08fr]">
        <div className="hidden border-r border-neutral-200 bg-[#10231f] p-8 text-white md:flex md:flex-col md:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-200">
              System Tandas
            </p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight">
              Acceso operativo
            </h1>
          </div>

          <div className="space-y-3 text-sm text-emerald-50/85">
            <p>Sucursal, ventas y tandas en un solo panel.</p>
            <p className="border-t border-white/15 pt-3">
              Sesion protegida con cookies httpOnly del servidor.
            </p>
          </div>
        </div>

        <div className="px-5 py-8 sm:px-10 md:px-12">
          <div className="mb-8">
            <p className="text-sm font-semibold text-emerald-700">
              System Tandas
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-neutral-950">
              Iniciar sesion
            </h2>
          </div>

          <form className="space-y-5" noValidate onSubmit={onSubmit}>
            {serverError ? <Alert>{serverError}</Alert> : null}

            <div className="space-y-2">
              <Label htmlFor="identifier">Correo o usuario</Label>
              <div className="relative">
                <UserRound
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500"
                />
                <Input
                  id="identifier"
                  autoComplete="username"
                  aria-invalid={Boolean(errors.identifier)}
                  className="pl-9"
                  placeholder="correo@dominio.com o usuario"
                  {...register("identifier")}
                />
              </div>
              {errors.identifier ? (
                <p className="text-sm text-red-700">
                  {errors.identifier.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contrasena</Label>
              <div className="relative">
                <LockKeyhole
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500"
                />
                <Input
                  id="password"
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                  className="pl-9 pr-11"
                  placeholder="contrasena"
                  type={isPasswordVisible ? "text" : "password"}
                  {...register("password")}
                />
                <Button
                  aria-label={
                    isPasswordVisible
                      ? "Ocultar contrasena"
                      : "Mostrar contrasena"
                  }
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={togglePasswordVisibility}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  {isPasswordVisible ? (
                    <EyeOff aria-hidden="true" className="size-4" />
                  ) : (
                    <Eye aria-hidden="true" className="size-4" />
                  )}
                </Button>
              </div>
              {errors.password ? (
                <p className="text-sm text-red-700">{errors.password.message}</p>
              ) : null}
            </div>

            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Validando" : "Entrar"}
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
