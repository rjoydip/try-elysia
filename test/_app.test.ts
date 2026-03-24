import { describe, expect, it } from "bun:test";
import { createApp } from "~/_app";
import { API_ENDPOINT, BASE_URL } from "./_test_utils";

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
    expect(body).toEqual({ error: "Endpoint not found" });
  });

  it("should return 404 for / routes", async () => {
    const app = createApp();
    const response = await app.handle(new Request(`${API_ENDPOINT}/`));
    const body = await response.json();

    expect(response.ok).toBeFalse();
    expect(response.status).toBe(404);
    expect(body).toEqual({ error: "Endpoint not found" });
  });

  it("should return 200 for /favicon.ico", async () => {
    const app = createApp();
    const response = await app.handle(new Request(`${BASE_URL}/favicon.ico`));

    expect(response.ok).toBeTrue();
    expect(response.status).toBe(200);
  });

  it("should handle thrown Errors by returning a JSON response", async () => {
    const app = createApp().get("/trigger-error", () => {
      throw new Error("Something went wrong");
    });

    const response = await app.handle(new Request(`${BASE_URL}/trigger-error`));
    const body = await response.json();

    expect(response.ok).toBeFalse();
    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Something went wrong" });
  });
});
