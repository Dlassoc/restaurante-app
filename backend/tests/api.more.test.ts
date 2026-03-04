import request from "supertest";
import { app } from "../src/app";
import { prisma } from "../src/prisma";

describe("API Integración Extra (GET/:id, PUT, DELETE)", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    await prisma.reserva.deleteMany();
    await prisma.menu.deleteMany();
    await prisma.restaurante.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function seedRestaurante() {
    const r = await request(app)
      .post("/restaurantes")
      .send({ nombre: "Seed", direccion: "Calle 1 #2-3", telefono: "3000000000" });

    expect(r.status).toBe(201);
    return Number(r.body.id);
  }

  it("Restaurantes: GET /:id (ok) y 404", async () => {
    const id = await seedRestaurante();

    const ok = await request(app).get(`/restaurantes/${id}`);
    expect(ok.status).toBe(200);
    expect(ok.body.id).toBe(id);

    const nf = await request(app).get(`/restaurantes/999999`);
    expect(nf.status).toBe(404);
  });

  it("Restaurantes: PUT /:id (ok) y 404", async () => {
    const id = await seedRestaurante();

    const up = await request(app)
      .put(`/restaurantes/${id}`)
      .send({ direccion: "Nueva direccion 123" });

    expect(up.status).toBe(200);
    expect(up.body.direccion).toBe("Nueva direccion 123");

    const nf = await request(app)
      .put(`/restaurantes/999999`)
      .send({ direccion: "X" });

    expect(nf.status).toBe(404);
  });

  it("Restaurantes: DELETE /:id (ok) y 404", async () => {
    const id = await seedRestaurante();

    const del = await request(app).delete(`/restaurantes/${id}`);
    expect(del.status).toBe(204);

    const nf = await request(app).delete(`/restaurantes/${id}`);
    expect(nf.status).toBe(404);
  });

  it("Menus: GET /:id (ok) y 404", async () => {
    const restauranteId = await seedRestaurante();

    const created = await request(app)
      .post("/menus")
      .send({ restauranteId, nombre: "Menu 1", precio: 10000, disponible: true });

    expect(created.status).toBe(201);
    const menuId = Number(created.body.id);

    const ok = await request(app).get(`/menus/${menuId}`);
    expect(ok.status).toBe(200);
    expect(ok.body.id).toBe(menuId);

    const nf = await request(app).get(`/menus/999999`);
    expect(nf.status).toBe(404);
  });

  it("Menus: PUT /:id (ok, cambia precio/disponible) y 404", async () => {
    const restauranteId = await seedRestaurante();

    const created = await request(app)
      .post("/menus")
      .send({ restauranteId, nombre: "Menu 2", precio: 12000, disponible: true });

    const menuId = Number(created.body.id);

    const up = await request(app)
      .put(`/menus/${menuId}`)
      .send({ precio: 15000, disponible: false });

    expect(up.status).toBe(200);
    expect(Number(up.body.precio)).toBe(15000);    expect(up.body.disponible).toBe(false);

    const nf = await request(app)
      .put(`/menus/999999`)
      .send({ precio: 20000 });

    expect(nf.status).toBe(404);
  });

  it("Menus: DELETE /:id (ok) y 404", async () => {
    const restauranteId = await seedRestaurante();

    const created = await request(app)
      .post("/menus")
      .send({ restauranteId, nombre: "Menu 3", precio: 9000 });

    const menuId = Number(created.body.id);

    const del = await request(app).delete(`/menus/${menuId}`);
    expect(del.status).toBe(204);

    const nf = await request(app).delete(`/menus/${menuId}`);
    expect(nf.status).toBe(404);
  });

  it("Reservas: GET /:id (ok) y 404", async () => {
    const restauranteId = await seedRestaurante();

    const fechaIso = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const created = await request(app)
      .post("/reservas")
      .send({ restauranteId, nombreCliente: "Carlos", personas: 3, fechaHora: fechaIso });

    expect(created.status).toBe(201);
    const reservaId = Number(created.body.id);

    const ok = await request(app).get(`/reservas/${reservaId}`);
    expect(ok.status).toBe(200);
    expect(ok.body.id).toBe(reservaId);

    const nf = await request(app).get(`/reservas/999999`);
    expect(nf.status).toBe(404);
  });

  it("Reservas: PUT /:id (ok, cambia personas/notas) y 404", async () => {
    const restauranteId = await seedRestaurante();

    const fechaIso = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const created = await request(app)
      .post("/reservas")
      .send({ restauranteId, nombreCliente: "Laura", personas: 2, fechaHora: fechaIso });

    const reservaId = Number(created.body.id);

    const up = await request(app)
      .put(`/reservas/${reservaId}`)
      .send({ personas: 4, notas: "Cumpleaños" });

    expect(up.status).toBe(200);
    expect(up.body.personas).toBe(4);
    expect(up.body.notas).toBe("Cumpleaños");

    const nf = await request(app)
      .put(`/reservas/999999`)
      .send({ personas: 2 });

    expect(nf.status).toBe(404);
  });

  it("Reservas: DELETE /:id (ok) y 404", async () => {
    const restauranteId = await seedRestaurante();

    const fechaIso = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const created = await request(app)
      .post("/reservas")
      .send({ restauranteId, nombreCliente: "Mateo", personas: 2, fechaHora: fechaIso });

    const reservaId = Number(created.body.id);

    const del = await request(app).delete(`/reservas/${reservaId}`);
    expect(del.status).toBe(204);

    const nf = await request(app).delete(`/reservas/${reservaId}`);
    expect(nf.status).toBe(404);
  });

  it("Validación: PUT reservas con fechaHora inválida debe dar 400", async () => {
    const restauranteId = await seedRestaurante();

    const fechaIso = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const created = await request(app)
      .post("/reservas")
      .send({ restauranteId, nombreCliente: "Juan", personas: 2, fechaHora: fechaIso });

    const reservaId = Number(created.body.id);

    const bad = await request(app)
      .put(`/reservas/${reservaId}`)
      .send({ fechaHora: "no-es-fecha" });

    expect(bad.status).toBe(400);
  });
});