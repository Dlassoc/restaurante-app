import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import restaurantesRouter from "../routes/restaurantes";
import menusRouter from "../routes/menus";
import reservasRouter from "../routes/reservas";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/restaurantes", restaurantesRouter);
app.use("/menus", menusRouter);
app.use("/reservas", reservasRouter);

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ error: "internal_error" });
});