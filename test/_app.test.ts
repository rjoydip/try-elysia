import { describe, expect, it } from "bun:test";
import { createApp } from "../src/_app";

describe("createApp", () => {
  it("should initialize the application", () => {
    const app = createApp();
    expect(app).toBeDefined();
  });

  it("should return 404 for non-existent routes", async () => {
    const app = createApp();
    const response = await app.handle(new Request("http://localhost/not-found"));
    const body = await response.json();

    expect(response.ok).toBeFalse();
    expect(response.status).toBe(404);
    expect(body).toEqual({ error: "Error: Endpoint not found" });
  });

  it("should handle thrown Errors by returning a JSON response", async () => {
    // Setup a route that throws an Error
    const app = createApp({ prefix: "" }).get("/trigger-error", () => {
      throw new Error("Something went wrong");
    });

    const response = await app.handle(new Request("http://localhost/trigger-error"));
    const body = await response.json();

    expect(response.ok).toBeFalse();
    expect(response.status).toBe(500);
    // The onError handler in _app.ts stringifies the error object
    expect(body).toEqual({ error: "Error: Something went wrong" });
  });
});
