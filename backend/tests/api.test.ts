import request from "supertest";
import { app } from "../src/app";
import { prisma } from "../src/prisma";

describe("API Integración (Restaurante -> Menu -> Reserva)", () => {
  beforeAll(async () => {
    // Asegura conexión antes de tests
    await prisma.$connect();
  });

  beforeEach(async () => {
    // Limpieza para que los tests sean repetibles
    // Orden importante por llaves foráneas
    await prisma.reserva.deleteMany();
    await prisma.menu.deleteMany();
    await prisma.restaurante.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("health check", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("CRUD básico de restaurantes: create + list", async () => {
    const create = await request(app)
      .post("/restaurantes")
      .send({ nombre: "La 70", direccion: "Calle 70 #10-20", telefono: "3001234567" });

    expect(create.status).toBe(201);
    expect(create.body.id).toBeDefined();
    expect(create.body.nombre).toBe("La 70");

    const list = await request(app).get("/restaurantes");
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.length).toBe(1);
    expect(list.body[0].nombre).toBe("La 70");
  });

  it("Flujo completo: crear restaurante -> crear menú -> crear reserva", async () => {
    // 1) restaurante
    const r = await request(app)
      .post("/restaurantes")
      .send({ nombre: "El Patio", direccion: "Cra 10 #20-30" });

    expect(r.status).toBe(201);
    const restauranteId = Number(r.body.id);
    // 2) menú
    const m = await request(app)
      .post("/menus")
      .send({ restauranteId, nombre: "Menu Ejecutivo", precio: 25000, disponible: true });

    expect(m.status).toBe(201);
    expect(m.body.restauranteId).toBe(restauranteId);

    // 3) reserva (ISO)
    const fechaIso = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1h en el futuro
    const resv = await request(app)
      .post("/reservas")
      .send({ restauranteId, nombreCliente: "Ana", personas: 2, fechaHora: fechaIso, notas: "Ventana" });

    expect(resv.status).toBe(201);
    expect(resv.body.restauranteId).toBe(restauranteId);
    expect(resv.body.nombreCliente).toBe("Ana");
    expect(resv.body.personas).toBe(2);

    // 4) listados
    const menus = await request(app).get("/menus");
    expect(menus.status).toBe(200);
    expect(menus.body.length).toBe(1);

    const reservas = await request(app).get("/reservas");
    expect(reservas.status).toBe(200);
    expect(reservas.body.length).toBe(1);
  });

  it("Validaciones: no permite crear menú si restaurante no existe", async () => {
    const res = await request(app)
      .post("/menus")
      .send({ restauranteId: 999999, nombre: "Menu fantasma", precio: 10000 });

    // en tus rutas lo dejaste como 404 restaurante_not_found
    expect(res.status).toBe(404);
  });

  it("Validaciones: no permite reserva con personas inválidas", async () => {
    const r = await request(app)
      .post("/restaurantes")
      .send({ nombre: "Casa", direccion: "Calle 1 #2-3" });

    const restauranteId = r.body.id as number;
    const fechaIso = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const res = await request(app)
      .post("/reservas")
      .send({ restauranteId, nombreCliente: "Juan", personas: 0, fechaHora: fechaIso });

    expect(res.status).toBe(400);
  });
});