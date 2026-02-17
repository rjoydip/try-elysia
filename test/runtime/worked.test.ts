import { describe, expect, it } from "bun:test";
import app from "~/runtime/workerd";
import { API_ENDPOINT } from "../_test_utils";

describe("Worked Runtime", () => {
  it("should initialize the app", () => {
    expect(app).toBeDefined();
    expect(app.server).toBeDefined();
  });

  it("should return a text/plain response for root", async () => {
    const response = await app.handle(new Request(API_ENDPOINT));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/plain");
    expect(await response.text()).toContain("Welcome");
  });

  it("should return a application/json response for /health", async () => {
    const response = await app.handle(new Request(`${API_ENDPOINT}/health`));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/json");
    const body = await response.json();
    expect(body).toHaveProperty("name");
  });
});
