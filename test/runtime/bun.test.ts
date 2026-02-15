import { describe, expect, it } from "bun:test";
import app from "~/runtime/bun";
import { API_ENDPOINT } from "../_test_utils";

describe("Bun Runtime", () => {
  it("should initialize the app", () => {
    expect(app).toBeDefined();
    expect(app.server).toBeDefined();
    expect(app.server?.protocol).toBeDefined();
    expect(app.server?.hostname).toBeDefined();
    expect(app.server?.port).toBeDefined();
  });

  it("should return a text/plain response for root", async () => {
    const response = await app.handle(new Request(API_ENDPOINT));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
    expect(response.headers.get("Content-Length")).toBeDefined();
    expect(await response.text()).toContain("Welcome");
  });

  it("should return a application/json response for /meta", async () => {
    const response = await app.handle(new Request(`${API_ENDPOINT}/meta`));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    expect(response.headers.get("Content-Length")).toBeDefined();

    const body = await response.json();
    expect(body).toHaveProperty("name");
  });
});
