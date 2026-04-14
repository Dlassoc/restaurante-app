import { Router } from "express";
import { prisma } from "./../src/prisma";
import { z } from "zod";

const router = Router();

const createSchema = z.object({
  restauranteId: z.number().int().positive(),
  nombre: z.string().min(2),
  precio: z.number().positive(),
  disponible: z.boolean().optional(),
});

const updateSchema = createSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: "empty_body" });

router.get("/", async (_req, res) => {
  const data = await prisma.menu.findMany({
    orderBy: { id: "asc" },
  });
  res.json(data);
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "invalid_id" });

  const data = await prisma.menu.findUnique({ where: { id } });
  if (!data) return res.status(404).json({ error: "not_found" });

  res.json(data);
});

router.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  // validar que restaurante exista (buena práctica)
  const rest = await prisma.restaurante.findUnique({
    where: { id: parsed.data.restauranteId },
  });
  if (!rest) return res.status(404).json({ error: "restaurante_not_found" });

  const created = await prisma.menu.create({
    data: {
      restauranteId: parsed.data.restauranteId,
      nombre: parsed.data.nombre,
      precio: parsed.data.precio, // Prisma Decimal acepta number
      disponible: parsed.data.disponible ?? true,
    },
  });

  res.status(201).json(created);
});

const updateMenu = async (req: any, res: any) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "invalid_id" });

  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  // si viene restauranteId, validar existencia
  if (parsed.data.restauranteId) {
    const rest = await prisma.restaurante.findUnique({
      where: { id: parsed.data.restauranteId },
    });
    if (!rest) return res.status(404).json({ error: "restaurante_not_found" });
  }

  try {
    const updated = await prisma.menu.update({
      where: { id },
      data: parsed.data,
    });
    res.json(updated);
  } catch {
    res.status(404).json({ error: "not_found" });
  }
};

router.put("/:id", updateMenu);
router.patch("/:id", updateMenu);

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "invalid_id" });

  try {
    await prisma.menu.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "not_found" });
  }
});

export default router;