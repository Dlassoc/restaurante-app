import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import restaurantesRouter from "../routes/restaurantes";
import menusRouter from "../routes/menus";
import reservasRouter from "../routes/reservas";
import { prisma } from "./prisma";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/api/v2/health", (_req, res) => res.json({ ok: true, version: "v2" }));

app.get("/api/v2/health/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: "up" });
  } catch (error) {
    console.error("ERROR /api/v2/health/db:", error);
    res.status(503).json({ ok: false, db: "down" });
  }
});

app.use("/restaurantes", restaurantesRouter);
app.use("/menus", menusRouter);
app.use("/reservas", reservasRouter);

app.use("/api/v2/restaurantes", restaurantesRouter);
app.use("/api/v2/menus", menusRouter);
app.use("/api/v2/reservas", reservasRouter);

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ error: "internal_error" });
});