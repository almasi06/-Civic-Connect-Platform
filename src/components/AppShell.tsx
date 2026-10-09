import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Menu as MenuIcon, WifiOff, X } from "lucide-react";
import { CITY } from "@/config/city";
import { useOnline } from "@/hooks/use-requests";
import { currentStaff, logout } from "@/application/auth";

export function AppShell({ children }: { children: ReactNode }) {
  const online = useOnline();
  const nav = useNavigate();
  const staff = currentStaff();
  const [menuOpen, setMenuOpen] = useState(false);
  const [alert, setAlert] = useState<{ title: string; body: string } | null>(null);

  useEffect(() => {
    const h = (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      const detail: unknown = event.detail;
      if (
        detail &&
        typeof detail === "object" &&
        "title" in detail &&
        typeof detail.title === "string" &&
        "body" in detail &&
        typeof detail.body === "string"
      ) {
        setAlert({ title: detail.title, body: detail.body });
      }
    };
    window.addEventListener("cc-alert", h);
    return () => window.removeEventListener("cc-alert", h);
  }, []);

  return (
    <div className="shell">
      <header className="shell-header">
        <div className="shell-header-inner">
          <Link to="/" className="shell-brand">
            <img className="shell-brand-logo" src="/tshwane-city-logo.png" alt="City of Tshwane logo" />
            <span>{CITY.name} <span className="shell-brand-accent">Fix</span></span>
          </Link>
          <button
            className="shell-nav-toggle"
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <MenuIcon size={20} aria-hidden="true" />}
            <span>Menu</span>
          </button>
          <nav
            id="primary-navigation"
            className={`shell-nav${menuOpen ? " is-open" : ""}`}
            aria-label="Main navigation"
          >
            <Link to="/" activeOptions={{ exact: true }} className="shell-nav-button" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/report" className="shell-nav-button" onClick={() => setMenuOpen(false)}>Report</Link>
            <Link to="/track" onClick={() => setMenuOpen(false)}>My reports</Link>
            <Link to="/reports" onClick={() => setMenuOpen(false)}>Area reports</Link>
            {staff ? (
              <>
                <Link to={staff.role === "admin" ? "/admin" : "/worker"} onClick={() => setMenuOpen(false)}>
                  {staff.role === "admin" ? "Admin page" : "My jobs"}
                </Link>
                <button
                  className="shell-nav-logout"
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    void (async () => {
                      try {
                        await logout();
                      } catch (error) {
                        window.dispatchEvent(new CustomEvent("cc-alert", {
                          detail: {
                            title: "Sign-out request failed",
                            body: error instanceof Error ? error.message : "Could not contact the server.",
                          },
                        }));
                      }
                      await nav({ to: "/login" });
                    })();
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)}>Staff</Link>
            )}
          </nav>
        </div>
      </header>

      {!online && (
        <div className="offline-banner">
          <WifiOff size={16} /> You are offline. Your reports are saved and will send later.
        </div>
      )}

      {alert && (
        <div role="alert" className="alert-banner">
          <div>
            <p className="bold">{alert.title}</p>
            <p className="muted small">{alert.body}</p>
          </div>
          <button aria-label="Close" onClick={() => setAlert(null)}>
            <X size={20} />
          </button>
        </div>
      )}

      <main className="shell-main">{children}</main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <p>
            <strong>City of Tshwane Call Centre:</strong>{" "}
            <a href="tel:+27123589999">(012) 358 9999</a>
            <span aria-hidden="true"> · </span>
            <strong>Toll-free:</strong>{" "}
            <a href="tel:08001111556">080 111 1556</a>
          </p>
          <p>
            Municipal service area: City of Tshwane, Gauteng.{" "}
            <a href="https://www.tshwane.gov.za/?page_id=953" target="_blank" rel="noreferrer">
              City contact information
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}