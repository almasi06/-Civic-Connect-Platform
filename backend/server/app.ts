import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth";
import { requestsRouter } from "./routes/requests";
import { syncRouter } from "./routes/sync";
import { workersRouter } from "./routes/workers";
import { teamsRouter } from "./routes/teams";
import { pingDb } from "./db";
import { errorHandler, notFound } from "./middleware/error.middleware";

const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: "4mb" }));

app.get("/health", async (_req, res) => {
  const dbOk = await pingDb();
  res.json({ ok: true, db: dbOk ? "connected" : "disconnected" });
});

app.use("/api/auth", authRouter);
app.use("/api/requests", requestsRouter);
app.use("/api/sync", syncRouter);
app.use("/api/workers", workersRouter);
app.use("/api/teams", teamsRouter);
app.use(notFound);
app.use(errorHandler);

export default app;
