import { Router } from "express";
import { prisma } from "./../src/prisma";
import { z } from "zod";

const router = Router();
const RESTAURANTES_WEBHOOK_URL =
  process.env.RESTAURANTES_WEBHOOK_URL ??
  "https://handle-request-315329759921.us-east1.run.app/";

const createSchema = z.object({
  nombre: z.string().min(2),
  direccion: z.string().min(5),
  telefono: z.string().min(3).optional(),
});

const updateSchema = createSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: "empty_body" });

router.get("/", async (_req, res) => {
  try {
    const data = await prisma.restaurante.findMany({ orderBy: { id: "asc" } });
    res.json(data);
  } catch (e) {
    console.error("ERROR /restaurantes:", e);
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

  try {
    const webhookResponse = await fetch(RESTAURANTES_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(created),
    });

    if (!webhookResponse.ok) {
      return res.status(502).json({
        error: "webhook_failed",
        webhookStatus: webhookResponse.status,
      });
    }
  } catch (error) {
    console.error("ERROR webhook /restaurantes:", error);
    return res.status(502).json({ error: "webhook_failed" });
  }

  res.status(201).json(created);
});

const updateRestaurante = async (req: any, res: any) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "invalid_id" });

  const parsed = updateSchema.safeParse(req.body);
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
};

router.put("/:id", updateRestaurante);
router.patch("/:id", updateRestaurante);

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