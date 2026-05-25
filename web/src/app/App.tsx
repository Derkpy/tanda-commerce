import { AppProvider } from "./providers/app-provider";
import { AppRouter } from "./router/app-router";

export function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
