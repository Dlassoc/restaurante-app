import { Router } from "express";
import { prisma } from "./../src/prisma";
import { z } from "zod";

const router = Router();

const createSchema = z.object({
  restauranteId: z.number().int().positive(),
  nombreCliente: z.string().min(2),
  personas: z.number().int().positive(),
  fechaHora: z.string().datetime(), // ISO 8601
  notas: z.string().optional(),
});

router.get("/", async (_req, res) => {
  const data = await prisma.reserva.findMany({
    orderBy: { id: "asc" },
  });
  res.json(data);
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "invalid_id" });

  const data = await prisma.reserva.findUnique({ where: { id } });
  if (!data) return res.status(404).json({ error: "not_found" });

  res.json(data);
});

router.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const rest = await prisma.restaurante.findUnique({
    where: { id: parsed.data.restauranteId },
  });
  if (!rest) return res.status(404).json({ error: "restaurante_not_found" });

  const created = await prisma.reserva.create({
    data: {
      restauranteId: parsed.data.restauranteId,
      nombreCliente: parsed.data.nombreCliente,
      personas: parsed.data.personas,
      fechaHora: new Date(parsed.data.fechaHora),
      notas: parsed.data.notas,
    },
  });

  res.status(201).json(created);
});

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "invalid_id" });

  const parsed = createSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  if (parsed.data.restauranteId) {
    const rest = await prisma.restaurante.findUnique({
      where: { id: parsed.data.restauranteId },
    });
    if (!rest) return res.status(404).json({ error: "restaurante_not_found" });
  }

  const dataToUpdate: any = { ...parsed.data };
  if (parsed.data.fechaHora) dataToUpdate.fechaHora = new Date(parsed.data.fechaHora);

  try {
    const updated = await prisma.reserva.update({
      where: { id },
      data: dataToUpdate,
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
    await prisma.reserva.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "not_found" });
  }
});

export default router;