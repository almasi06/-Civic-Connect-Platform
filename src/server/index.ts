// Express API for CivicConnect.
//
//   npm run dev:api   → starts this on http://localhost:4000
//
// Security and the real database driver are intentionally absent. Search for
// `TODO(security)` and `DB NOTE` to find every spot where they plug in.
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth";
import { requestsRouter } from "./routes/requests";
import { syncRouter } from "./routes/sync";
import { workersRouter } from "./routes/workers";
import { teamsRouter } from "./routes/teams";

const app = express();

// Dev-only CORS. In production, put the frontend behind the same origin or
// whitelist the domain explicitly.
app.use(cors({ origin: true }));
app.use(express.json({ limit: "4mb" })); // room for base64 photos

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/requests", requestsRouter);
app.use("/api/sync", syncRouter);
app.use("/api/workers", workersRouter);
app.use("/api/teams", teamsRouter);

const PORT = Number(process.env.API_PORT ?? 4000);
app.listen(PORT, () => {
  console.log(`CivicConnect API listening on http://localhost:${PORT}`);
});