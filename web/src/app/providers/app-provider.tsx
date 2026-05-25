import { type PropsWithChildren, useEffect } from "react";
import { authApi } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/features/auth/model/auth.store";

export function AppProvider({ children }: PropsWithChildren) {
  const setAnonymous = useAuthStore((state) => state.setAnonymous);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setChecking = useAuthStore((state) => state.setChecking);

  useEffect(() => {
    let isMounted = true;

    setChecking();

    authApi
      .me()
      .then((user) => {
        if (isMounted) {
          setAuthenticated(user);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAnonymous();
        }
      });

    return () => {
      isMounted = false;
    };
  }, [setAnonymous, setAuthenticated, setChecking]);

  return <>{children}</>;
}
