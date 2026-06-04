import { type PropsWithChildren, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Boxes,
  Home,
  LogOut,
  Menu,
  PackagePlus,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShoppingCart,
  UsersRound,
} from "lucide-react";
import { useLogoutController } from "@/features/auth/controller/use-logout-controller";
import { useAuthStore } from "@/features/auth/model/auth.store";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/cn";
import { t } from "@/shared/lib/i18n";

type SidebarMode = "expanded" | "collapsed" | "hidden";

const navigationItems = [
  { label: t("menu.dashboard"), icon: Home, path: "/app" },
  { label: t("menu.clients"), icon: UsersRound, path: "/app/clients" },
  { label: t("menu.tanda"), icon: ShoppingCart, path: "/app/tanda" },
  { label: t("menu.products"), icon: PackagePlus, path: "/app/products" },
];

export function DashboardLayout({ children }: PropsWithChildren) {
  const user = useAuthStore((state) => state.user);
  const { isLoggingOut, logout } = useLogoutController();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>(() => {
    if (typeof window === "undefined") {
      return "expanded";
    }

    return window.matchMedia("(min-width: 1024px)").matches ? "expanded" : "hidden";
  });
  const [isTopbarVisible, setIsTopbarVisible] = useState(true);

  const isSidebarExpanded = sidebarMode === "expanded";
  const isSidebarVisible = sidebarMode !== "hidden";
  const contentOffsetClass =
    sidebarMode === "expanded"
      ? "lg:pl-[13.6rem]"
      : sidebarMode === "collapsed"
        ? "lg:pl-20"
        : "lg:pl-0";

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let hiddenScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const hideThreshold = viewportHeight * 0.3;
      const showDistance = viewportHeight * 0.4;

      if (currentScrollY < 32) {
        setIsTopbarVisible(true);
        hiddenScrollY = currentScrollY;
        lastScrollY = currentScrollY;
        return;
      }

      if (currentScrollY > lastScrollY && currentScrollY > hideThreshold) {
        setIsTopbarVisible(false);
        hiddenScrollY = currentScrollY;
      }

      if (currentScrollY < lastScrollY && hiddenScrollY - currentScrollY >= showDistance) {
        setIsTopbarVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSidebarControl = () => {
    setSidebarMode((current) => {
      if (current === "expanded") {
        return "collapsed";
      }

      if (current === "collapsed") {
        return "hidden";
      }

      return "expanded";
    });
  };

  const showSidebar = () => setSidebarMode("expanded");

  return (
    <main className="min-h-screen bg-[#080b19] text-white">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.22),_transparent_32%),radial-gradient(circle_at_85%_15%,_rgba(14,165,233,0.14),_transparent_28%),linear-gradient(180deg,_#101022_0%,_#070914_55%,_#050711_100%)]" />

      {isSidebarVisible ? (
        <button
          aria-label={t("menu.hide_sidebar")}
          className="fixed inset-0 z-20 bg-black/45 lg:hidden"
          onClick={() => setSidebarMode("hidden")}
          type="button"
        />
      ) : null}

      <div className="relative min-h-screen">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 flex h-screen flex-col overflow-y-auto border-r border-white/10 bg-black/30 py-5 backdrop-blur-xl transition-all duration-300 ease-out",
            isSidebarVisible ? "translate-x-0" : "-translate-x-full",
            isSidebarExpanded ? "w-[min(82vw,17rem)] px-4 lg:w-[13.6rem]" : "w-20 px-3",
          )}
        >
          <div
            className={cn(
              "mb-8 flex items-center gap-2",
              isSidebarExpanded ? "px-2" : "justify-center px-0",
            )}
          >
            <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-400 via-fuchsia-500 to-indigo-500 shadow-lg shadow-violet-950/50">
              <Boxes aria-hidden="true" className="size-5" />
            </div>
            {isSidebarExpanded ? (
              <div className="min-w-0">
                <p className="text-sm font-semibold">{t("dashboard.sidebar_name")}</p>
              </div>
            ) : null}
            <button
              aria-label={
                isSidebarExpanded ? t("menu.collapse_sidebar") : t("menu.hide_sidebar")
              }
              className={cn(
                "ml-auto grid size-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-neutral-300 transition hover:bg-white/10 hover:text-white",
                !isSidebarExpanded && "ml-0",
              )}
              onClick={handleSidebarControl}
              title={isSidebarExpanded ? t("menu.collapse_sidebar") : t("menu.hide_sidebar")}
              type="button"
            >
              {isSidebarExpanded ? (
                <PanelLeftClose aria-hidden="true" className="size-4" />
              ) : (
                <PanelLeftOpen aria-hidden="true" className="size-4" />
              )}
            </button>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const isActive =
                item.path === "/app"
                  ? location.pathname === "/app"
                  : Boolean(item.path && location.pathname.startsWith(item.path));

              return (
                <button
                  key={item.label}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-neutral-400 transition-all duration-200 hover:bg-white/5 hover:text-white",
                    !isSidebarExpanded && "justify-center px-0",
                    isActive &&
                      "border border-violet-400/30 bg-gradient-to-r from-violet-500/30 to-indigo-500/20 text-white shadow-xl shadow-violet-950/30",
                  )}
                  onClick={() => {
                    if (item.path) {
                      navigate(item.path);
                    }
                  }}
                  title={item.label}
                  type="button"
                >
                  <item.icon aria-hidden="true" className="size-5" />
                  {isSidebarExpanded ? item.label : null}
                </button>
              );
            })}
          </nav>

          <div
            className={cn(
              "mt-auto rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20",
              isSidebarExpanded ? "p-4" : "p-2",
            )}
          >
            <div
              className={cn(
                "flex items-center gap-3",
                !isSidebarExpanded && "justify-center",
              )}
            >
              <div className="grid size-11 place-items-center rounded-2xl bg-white/10 text-sm font-semibold">
                {(user?.name ?? "U").slice(0, 1).toUpperCase()}
              </div>
              {isSidebarExpanded ? (
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {user?.name ?? t("auth.fallback_user")}
                  </p>
                  <p className="truncate text-xs text-neutral-500">
                    {user?.role ?? t("auth.fallback_role")}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </aside>

        <section
          className={cn(
            "min-w-0 transition-[padding] duration-300 ease-out",
            contentOffsetClass,
          )}
        >
          <header
            className={cn(
              "sticky top-0 z-20 border-b border-white/10 bg-[#080b19]/80 backdrop-blur-xl transition-all duration-300 ease-out",
              isTopbarVisible
                ? "translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-full opacity-0",
            )}
          >
            <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-10">
              <button
                aria-label={
                  isSidebarVisible ? t("menu.toggle_sidebar") : t("menu.show_sidebar")
                }
                className="grid size-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/10"
                onClick={isSidebarVisible ? handleSidebarControl : showSidebar}
                title={isSidebarVisible ? t("menu.toggle_sidebar") : t("menu.show_sidebar")}
                type="button"
              >
                {isSidebarVisible ? (
                  <Menu aria-hidden="true" className="size-5" />
                ) : (
                  <PanelLeftOpen aria-hidden="true" className="size-5" />
                )}
              </button>

              <div className="lg:hidden">
                <div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-400 via-fuchsia-500 to-indigo-500">
                  <Boxes aria-hidden="true" className="size-5" />
                </div>
              </div>

              <div className="hidden min-w-0 sm:block">
                <p className="text-md text-neutral-500">{t("menu.dashboard")}</p>
              </div>

              <div className="ml-auto flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] p-1">
                <TopbarButton icon={UsersRound} label={t("auth.profile")} />
                <TopbarButton icon={Settings} label={t("auth.settings")} />
                <Button
                  aria-label={t("auth.logout")}
                  className="size-11 rounded-full border border-white/10 bg-white/5 text-white hover:bg-rose-500/15 hover:text-rose-100 focus-visible:ring-violet-400/50 focus-visible:ring-offset-0"
                  disabled={isLoggingOut}
                  onClick={logout}
                  size="icon"
                  title={t("auth.logout")}
                  variant="ghost"
                >
                  <LogOut aria-hidden="true" className="size-5" />
                </Button>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
            {children ?? <Outlet />}
          </div>
        </section>
      </div>
    </main>
  );
}

function TopbarButton({
  icon: Icon,
  label,
}: {
  icon: typeof UsersRound;
  label: string;
}) {
  return (
    <button
      className="hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-neutral-300 transition hover:bg-white/10 hover:text-white sm:flex"
      type="button"
    >
      <Icon aria-hidden="true" className="size-4" />
      {label}
    </button>
  );
}
