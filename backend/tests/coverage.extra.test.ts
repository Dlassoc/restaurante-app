import request from "supertest";
import { app } from "../src/app";
import { prisma } from "../src/prisma";

describe("Cobertura extra (branches: rutas + app)", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(async () => {
    // Silencia console.error para evitar ruido al forzar errores intencionalmente
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    consoleErrorSpy.mockRestore();
  });

  beforeEach(async () => {
    await prisma.reserva.deleteMany();
    await prisma.menu.deleteMany();
    await prisma.restaurante.deleteMany();
  });

  async function seedRestaurante() {
    const r = await request(app)
      .post("/v2/restaurantes")
      .send({ nombre: "Seed", direccion: "Calle 1 #2-3", telefono: "3000000000" });

    expect(r.status).toBe(201);
    return Number(r.body.id);
  }

  async function seedMenu(restauranteId: number) {
    const r = await request(app)
      .post("/v2/menus")
      .send({ restauranteId, nombre: "Menu Seed", precio: 10000, disponible: true });

    expect(r.status).toBe(201);
    return Number(r.body.id);
  }

  async function seedReserva(restauranteId: number) {
    const fechaIso = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const r = await request(app)
      .post("/v2/reservas")
      .send({ restauranteId, nombreCliente: "Seed Cliente", personas: 2, fechaHora: fechaIso });

    expect(r.status).toBe(201);
    return Number(r.body.id);
  }

  // ----------------------------
  // src/app.ts -> cubrir handler de error (24-25) SIN ensuciar consola
  // Forzamos un error en una ruta existente mockeando prisma.
  // ----------------------------
  it("App: middleware de error devuelve 500 (cubre src/app.ts 24-25)", async () => {
    const spy = jest.spyOn(prisma.menu, "findMany").mockRejectedValueOnce(new Error("boom"));

    const r = await request(app).get("/v2/menus");
    expect(r.status).toBe(500);
    expect(r.body).toEqual({ error: "internal_error" });

    spy.mockRestore();
  });

  // ----------------------------
  // Restaurantes: ramas de invalid_id + zod
  // ----------------------------
  it("Restaurantes: GET /:id con id inválido -> 400", async () => {
    const r = await request(app).get("/v2/restaurantes/abc");
    expect(r.status).toBe(400);
    expect(r.body).toEqual({ error: "invalid_id" });
  });

  it("Restaurantes: PUT /:id con id inválido -> 400", async () => {
    const r = await request(app)
      .put("/v2/restaurantes/abc")
      .send({ direccion: "Direccion valida 123" });
    expect(r.status).toBe(400);
    expect(r.body).toEqual({ error: "invalid_id" });
  });

  it("Restaurantes: DELETE /:id con id inválido -> 400", async () => {
    const r = await request(app).delete("/v2/restaurantes/abc");
    expect(r.status).toBe(400);
    expect(r.body).toEqual({ error: "invalid_id" });
  });

  it("Restaurantes: POST / con body inválido -> 400 (zod)", async () => {
    const r = await request(app).post("/v2/restaurantes").send({ direccion: "X" });
    expect(r.status).toBe(400);
  });

  // ----------------------------
  // Menus: ramas típicas (invalid_id, validación, not_found)
  // ----------------------------
  it("Menus: GET /:id con id inválido -> 400", async () => {
    const r = await request(app).get("/v2/menus/abc");
    expect(r.status).toBe(400);
    expect(r.body).toEqual({ error: "invalid_id" });
  });

  it("Menus: PUT /:id con id inválido -> 400", async () => {
    const r = await request(app).put("/v2/menus/abc").send({ precio: 20000 });
    expect(r.status).toBe(400);
    expect(r.body).toEqual({ error: "invalid_id" });
  });

  it("Menus: DELETE /:id con id inválido -> 400", async () => {
    const r = await request(app).delete("/v2/menus/abc");
    expect(r.status).toBe(400);
    expect(r.body).toEqual({ error: "invalid_id" });
  });

  it("Menus: POST / con body inválido -> 400 (zod)", async () => {
    const restauranteId = await seedRestaurante();
    const r = await request(app).post("/v2/menus").send({ restauranteId, nombre: "X" });
    expect(r.status).toBe(400);
  });

  it("Menus: GET /:id 404 cuando no existe", async () => {
    const r = await request(app).get("/v2/menus/999999");
    expect(r.status).toBe(404);
  });

  it("Menus: PUT /:id 404 cuando no existe (body válido)", async () => {
    const restauranteId = await seedRestaurante();
    const r = await request(app)
      .put("/v2/menus/999999")
      .send({ restauranteId, nombre: "Menu Valido", precio: 12345, disponible: true });
    expect(r.status).toBe(404);
  });

  it("Menus: DELETE /:id 404 cuando no existe", async () => {
    const r = await request(app).delete("/v2/menus/999999");
    expect(r.status).toBe(404);
  });

  // ----------------------------
  // Reservas: ramas típicas (invalid_id, validación, not_found)
  // ----------------------------
  it("Reservas: GET /:id con id inválido -> 400", async () => {
    const r = await request(app).get("/v2/reservas/abc");
    expect(r.status).toBe(400);
    expect(r.body).toEqual({ error: "invalid_id" });
  });

  it("Reservas: PUT /:id con id inválido -> 400", async () => {
    const r = await request(app).put("/v2/reservas/abc").send({ personas: 2 });
    expect(r.status).toBe(400);
    expect(r.body).toEqual({ error: "invalid_id" });
  });

  it("Reservas: DELETE /:id con id inválido -> 400", async () => {
    const r = await request(app).delete("/v2/reservas/abc");
    expect(r.status).toBe(400);
    expect(r.body).toEqual({ error: "invalid_id" });
  });

  it("Reservas: POST / con fechaHora inválida -> 400", async () => {
    const restauranteId = await seedRestaurante();
    const r = await request(app).post("/v2/reservas").send({
      restauranteId,
      nombreCliente: "Cliente",
      personas: 2,
      fechaHora: "no-es-fecha",
    });
    expect(r.status).toBe(400);
  });

  it("Reservas: GET /:id 404 cuando no existe", async () => {
    const r = await request(app).get("/v2/reservas/999999");
    expect(r.status).toBe(404);
  });

  it("Reservas: PUT /:id 404 cuando no existe (body válido)", async () => {
    const restauranteId = await seedRestaurante();
    const fechaIso = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
    const r = await request(app)
      .put("/v2/reservas/999999")
      .send({ restauranteId, nombreCliente: "Valido", personas: 2, fechaHora: fechaIso });
    expect(r.status).toBe(404);
  });

  it("Reservas: DELETE /:id 404 cuando no existe", async () => {
    const r = await request(app).delete("/v2/reservas/999999");
    expect(r.status).toBe(404);
  });

  // ----------------------------
  // Smoke final
  // ----------------------------
  it("Smoke: seeds completos funcionan (restaurante + menu + reserva)", async () => {
    const restauranteId = await seedRestaurante();
    const menuId = await seedMenu(restauranteId);
    const reservaId = await seedReserva(restauranteId);

    const m = await request(app).get(`/v2/menus/${menuId}`);
    expect(m.status).toBe(200);

    const rr = await request(app).get(`/v2/reservas/${reservaId}`);
    expect(rr.status).toBe(200);
  });
});