import request from "supertest";
import { app } from "../src/app";

describe("GET /v2/health", () => {
  it("should return ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});