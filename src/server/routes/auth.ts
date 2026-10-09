import { Router } from "express";
import { MOCK_STAFF, store } from "../store";

export const authRouter = Router();

/**
 * POST /api/auth/login
 *
 * TODO(security): replace the password equality check with bcrypt compare,
 * and replace the fake token with a signed JWT (jsonwebtoken) that includes
 * { sub, role }. Add a rate limiter to slow brute-force attempts.
 */
authRouter.post("/login", (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const found = MOCK_STAFF.find(
    (u) => u.email.toLowerCase() === email.toLowerCase().trim(),
  );

  // DB NOTE: replace with `const hash = await prisma.staff.findUnique(...)`
  // and `await bcrypt.compare(password, hash)`.
  if (!found || found.password !== password.trim()) {
    return res.status(401).json({ message: "Email or password is incorrect" });
  }

  // TODO(security): this is not a real JWT. Sign one and store it in an
  // httpOnly cookie instead of returning it in the body.
  const token = `dev-token-${found.id}`;

  const session = {
    id: found.id,
    name: found.name,
    email: found.email,
    role: found.role,
    token,
  };

  store.users.set(found.id, session);
  res.json(session);
});

/**
 * POST /api/auth/logout
 *
 * TODO(security): invalidate the JWT (add to a deny list) and clear the cookie.
 */
authRouter.post("/logout", (req, res) => {
  const authorization = req.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : undefined;
  if (token) {
    for (const [id, user] of store.users) {
      if (user.token === token) store.users.delete(id);
    }
  }
  res.status(204).end();
});

/**
 * GET /api/auth/me
 *
 * TODO(security): read the JWT from the cookie / Authorization header and
 * decode it. For now we just return 401 so the frontend knows it must log in.
 */
authRouter.get("/me", (_req, res) => {
  res.status(401).json({ message: "Not implemented" });
});