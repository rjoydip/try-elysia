import { describe, expect, it } from "bun:test";
import app from "../../src/runtime/workerd";

describe("Worked Runtime", () => {
  it("should initialize the app", () => {
    expect(app).toBeDefined();
    expect(app.server).toBeDefined();
  });

  it("should return a text/plain response for root", async () => {
    const response = await app.handle(new Request("http://localhost/"));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/plain");
    expect(await response.text()).toContain("Welcome");
  });

  it("should return a application/json response for /meta", async () => {
    const response = await app.handle(new Request("http://localhost/meta"));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/json");
    const body = await response.json();
    expect(body).toHaveProperty("name");
    expect(body).toHaveProperty("version");
  });
});
