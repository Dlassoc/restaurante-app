import request from "supertest";
import { app } from "../src/app";
import { prisma } from "../src/prisma";

describe("Cobertura de ramas (invalid_id + error handler)", () => {
  beforeAll(async () => prisma.$connect());
  afterAll(async () => prisma.$disconnect());

  it("invalid_id en restaurantes", async () => {
    const res = await request(app).get("/restaurantes/abc");
    expect(res.status).toBe(400);
  });

  it("invalid_id en menus", async () => {
    const res = await request(app).get("/menus/abc");
    expect(res.status).toBe(400);
  });

  it("invalid_id en reservas", async () => {
    const res = await request(app).get("/reservas/abc");
    expect(res.status).toBe(400);
  });

  it("error handler (500) se ejecuta", async () => {
    // Forzamos error haciendo mock temporal a prisma para que arroje excepción
    const original = prisma.restaurante.findMany;
    // @ts-expect-error override para test
    prisma.restaurante.findMany = async () => {
      throw new Error("boom");
    };

    const res = await request(app).get("/restaurantes");
    expect(res.status).toBe(500);

    // restaurar
    prisma.restaurante.findMany = original;
  });
});