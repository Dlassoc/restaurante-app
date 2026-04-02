import { Router } from "express";
import { prisma } from "../src/prisma";
import { z } from "zod";

const router = Router();

const createSchema = z.object({
  nombre: z.string().min(2),
  direccion: z.string().min(5),
  telefono: z.string().min(3).optional(),
});

router.get("/", async (_req, res) => {
  try {
    const data = await prisma.restaurante.findMany({ orderBy: { id: "asc" } });
    res.json(data);
  } catch (e) {
    console.error("ERROR /v2/restaurantes:", e);
    res.status(500).json({ error: "internal_error" });
  }
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "invalid_id" });

  const data = await prisma.restaurante.findUnique({ where: { id } });
  if (!data) return res.status(404).json({ error: "not_found" });

  res.json(data);
});

router.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const created = await prisma.restaurante.create({ data: parsed.data });
  res.status(201).json(created);
});

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "invalid_id" });

  const parsed = createSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  try {
    const updated = await prisma.restaurante.update({
      where: { id },
      data: parsed.data,
    });
    res.json(updated);
  } catch {
    res.status(404).json({ error: "not_found" });
  }
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "invalid_id" });

  try {
    await prisma.restaurante.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "not_found" });
  }
});

export default router;