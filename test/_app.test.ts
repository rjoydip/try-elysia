import { describe, expect, it } from "bun:test";
import { createApp } from "~/_app";
import { API_ENDPOINT, BASE_URL } from "./_test_utils";
import { API_PREFIX } from "~/_config";

describe("createApp", () => {
  it("should initialize the application", async () => {
    const app = createApp();
    expect(app).toBeDefined();
  });

  it("should return 404 for non-existent routes", async () => {
    const app = createApp();
    const response = await app.handle(new Request(`${API_ENDPOINT}/not-found`));
    const body = await response.json();

    expect(response.ok).toBeFalse();
    expect(response.status).toBe(404);
    expect(body).toEqual({ error: "Error: Endpoint not found" });
  });

  it("should return 404 for / routes", async () => {
    const app = createApp();
    const response = await app.handle(new Request(`${API_ENDPOINT}/`));
    const body = await response.json();

    expect(response.ok).toBeFalse();
    expect(response.status).toBe(404);
    expect(body).toEqual({ error: "Error: Endpoint not found" });
  });

  it("should return 200 for /favicon.ico", async () => {
    const app = createApp();
    const response = await app.handle(new Request(`${BASE_URL}/favicon.ico`));

    expect(response.ok).toBeTrue();
    expect(response.status).toBe(200);
  });

  it("should handle thrown Errors by returning a JSON response", async () => {
    // Setup a route that throws an Error
    const app = createApp({ prefix: API_PREFIX }).get("/trigger-error", () => {
      throw new Error("Something went wrong");
    });

    const response = await app.handle(new Request(`${API_ENDPOINT}/trigger-error`));
    const body = await response.json();

    expect(response.ok).toBeFalse();
    expect(response.status).toBe(500);
    // The onError handler in _app.ts stringifies the error object
    expect(body).toEqual({ error: "Error: Something went wrong" });
  });
});
