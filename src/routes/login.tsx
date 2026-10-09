import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { login, type StaffRole } from "@/application/auth";
import { AppShell } from "@/components/AppShell";
import { CITY } from "@/config/city";

export const Route = createFileRoute("/login")({
  component: Login,
});

const schema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErr("");
    const values = schema.safeParse({ email, password });
    if (!values.success) {
      setErr("Please type your email and password.");
      return;
    }
    setBusy(true);
    try {
      const staff = await login(values.data.email, values.data.password);
      const destination: StaffRole = staff.role;
      await nav({ to: destination === "admin" ? "/admin" : "/worker" });
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <form onSubmit={submit} className="card card-primary stack">
        <h1>Municipal staff sign in</h1>
        <p className="muted small">
          Sign in with your {CITY.municipality} account. If you have forgotten
          your password, contact the IT helpdesk.
        </p>
        <p className="login-note">
          Local demo accounts: admin@tshwane.gov.za / admin1234 or
          worker@tshwane.gov.za / worker1234.
        </p>
        <div className="field">
          <label className="field-label" htmlFor="email">Work email</label>
          <input
            id="email"
            className="input"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="password">Password</label>
          <input
            id="password"
            className="input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        {err && <p role="alert" className="field-error">{err}</p>}
        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AppShell>
  );
}
