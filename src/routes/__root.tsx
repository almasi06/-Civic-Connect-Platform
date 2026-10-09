import { Outlet, Link, createRootRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { deviceId } from "@/lib/device";
import { checkForUpdates } from "@/domain/notificationService";
import { requestRepository } from "@/persistence/requestRepository";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  useEffect(() => {
    const id = deviceId();
    // Poll for reports resolved while offline or on another tab.
    const check = () => {
      const all = requestRepository.list();
      checkForUpdates(all, id);
    };
    check();
    const off = requestRepository.subscribe(check);
    void requestRepository.sync();
    void requestRepository.refresh().catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "Could not connect to the API.";
      window.dispatchEvent(new CustomEvent("cc-alert", {
        detail: { title: "API connection unavailable", body: message },
      }));
    });

    // Register the service worker in production for offline support.
    if ("serviceWorker" in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    return () => off();
  }, []);

  return <Outlet />;
}

function NotFoundComponent() {
  return (
    <AppShell>
      <div className="full-center">
        <div className="error-card">
          <h1>404</h1>
          <h2>Page not found</h2>
          <p className="muted">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="row-wrap center mt-4">
            <Link to="/" className="btn btn-primary">Go home</Link>
            <Link to="/report" className="btn btn-accent">Report a problem</Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}