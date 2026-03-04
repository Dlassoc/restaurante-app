import request from "supertest";
import { app } from "../src/app";
import { prisma } from "../src/prisma";

describe("Cobertura de branches (subir >85%)", () => {
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

  it("POST /restaurantes -> 400 cuando body es inválido (cubre restaurantes.ts línea 46)", async () => {
    // direccion muy corta + falta nombre (no pasa zod)
    const res = await request(app).post("/restaurantes").send({ direccion: "x" });
    expect(res.status).toBe(400);
  });

  it("POST /menus -> 400 cuando body es inválido (cubre menus.ts línea 58)", async () => {
    // falta nombre y precio -> no pasa zod
    const res = await request(app).post("/menus").send({ restauranteId: 1 });
    expect(res.status).toBe(400);
  });

  it("POST /menus -> 404 si restaurante no existe (cubre menus.ts línea 65)", async () => {
    const res = await request(app)
      .post("/menus")
      .send({ restauranteId: 999999, nombre: "Menu fantasma", precio: 10000 });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "restaurante_not_found" });
  });

  it("POST /reservas -> 404 si restaurante no existe (cubre reservas.ts línea 39)", async () => {
    const fechaIso = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const res = await request(app).post("/reservas").send({
      restauranteId: 999999,
      nombreCliente: "Ana",
      personas: 2,
      fechaHora: fechaIso,
    });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "restaurante_not_found" });
  });

  it("PUT /reservas/:id -> 404 si restauranteId enviado no existe (cubre reservas.ts línea 65)", async () => {
    // 1) Crear restaurante válido
    const r = await request(app)
      .post("/restaurantes")
      .send({ nombre: "El Patio", direccion: "Cra 10 #20-30" });

    expect(r.status).toBe(201);
    const restauranteId = Number(r.body.id);

    // 2) Crear reserva válida
    const fechaIso = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const resv = await request(app).post("/reservas").send({
      restauranteId,
      nombreCliente: "Juan",
      personas: 2,
      fechaHora: fechaIso,
    });

    expect(resv.status).toBe(201);
    const reservaId = Number(resv.body.id);

    // 3) Intentar actualizar enviando restauranteId inexistente => cae en if(parsed.data.restauranteId) + if(!rest)
    const upd = await request(app).put(`/reservas/${reservaId}`).send({
      restauranteId: 999999,
    });

    expect(upd.status).toBe(404);
    expect(upd.body).toEqual({ error: "restaurante_not_found" });
    
  });
});