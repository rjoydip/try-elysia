import { describe, expect, it } from "bun:test";
import edge from "~/runtime/edge";
import { API_ENDPOINT } from "../_test_utils";

describe("Edge Runtime", () => {
  it("should export default object with fetch", () => {
    expect(edge).toBeDefined();
    expect(typeof edge.fetch).toBe("function");
  });

  it("should handle requests via fetch", async () => {
    const response = await edge.fetch(new Request(API_ENDPOINT), {} as any, {} as any);
    expect(response).toBeInstanceOf(Response);
  });

  it("should return 404 for unknown path", async () => {
    const response = await edge.fetch(
      new Request(`${API_ENDPOINT}/unknown-route`),
      {} as any,
      {} as any,
    );
    expect(response.status).toBe(404);
  });

  it("should return a text/plain response for root", async () => {
    const response = await edge.fetch(new Request(API_ENDPOINT), {} as any, {} as any);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/plain");
    expect(await response.text()).toContain("Welcome");
  });

  it("should return a application/json response for /health", async () => {
    const response = await edge.fetch(new Request(`${API_ENDPOINT}/health`), {} as any, {} as any);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/json");
    const body = await response.json();
    expect(body).toHaveProperty("name");
  });
});
