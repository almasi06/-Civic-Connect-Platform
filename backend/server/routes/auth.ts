

// =============================================================================
// Auth routes: login, logout, me.
// =============================================================================
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { userRepository } from "../persistence/user.repository";
import { requireAuth } from "../middleware/auth.middleware";
import { asyncHandler, HttpError } from "../middleware/error.middleware";
import { validateBody } from "../middleware/validate.middleware";

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = "8h";

const isTest = process.env.NODE_ENV === "test" || process.env.DISABLE_RATE_LIMIT === "1";

// Rate-limit login attempts: 10 per 15 minutes per IP.
// Disabled in test mode to avoid blocking automated test suites.
const loginLimiter = isTest
  ? (_req: any, _res: any, next: any) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      message: { message: "Too many login attempts. Please try again later." },
    });

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
});

/**
 * POST /api/auth/login
 */
authRouter.post(
  "/login",
  loginLimiter,
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as z.infer<typeof loginSchema>;

    const user = await userRepository.findByEmail(email);
    if (!user || !user.is_active) {
      throw new HttpError(401, "Email or password is incorrect");
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new HttpError(401, "Email or password is incorrect");
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  }),
);

/**
 * POST /api/auth/logout
 *
 * JWTs are stateless. Client drops the token.
 * (Optionally, add a `token_denylist` table for server-side revocation.)
 */
authRouter.post("/logout", (_req, res) => {
  res.status(204).end();
});

/**
 * GET /api/auth/me
 */
authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await userRepository.findById(req.user!.id);
    if (!user || !user.is_active) {
      throw new HttpError(401, "User not found");
    }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  }),
);