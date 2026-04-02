import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import restaurantesRouter from "../routes/v2restaurantes";
import menusRouter from "../routes/v2menus";
import reservasRouter from "../routes/v2reservas";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/v2/health", (_req, res) => res.json({ ok: true }));

app.use("/v2/restaurantes", restaurantesRouter);
app.use("/v2/menus", menusRouter);
app.use("/v2/reservas", reservasRouter);

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ error: "internal_error" });
});