import request from "supertest";
import { app } from "../src/app";
import { prisma } from "../src/prisma";

describe("Cobertura de ramas (invalid_id + error handler)", () => {
  beforeAll(async () => prisma.$connect());
  afterAll(async () => prisma.$disconnect());

  it("invalid_id en restaurantes", async () => {
    const res = await request(app).get("/v2/restaurantes/abc");
    expect(res.status).toBe(400);
  });

  it("invalid_id en menus", async () => {
    const res = await request(app).get("/v2/menus/abc");
    expect(res.status).toBe(400);
  });

  it("invalid_id en reservas", async () => {
    const res = await request(app).get("/v2/reservas/abc");
    expect(res.status).toBe(400);
  });

});