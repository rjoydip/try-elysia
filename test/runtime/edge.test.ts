import { describe, expect, it } from "bun:test";
import edge from "~/runtime/edge";
import { API_ENDPOINT } from "../_test_utils";

describe("Edge Runtime", () => {
  it("should export default object with fetch", () => {
    expect(edge).toBeDefined();
    expect(typeof edge.fetch).toBe("function");
  });

  it("should handle requests via fetch", async () => {
    const request = new Request(API_ENDPOINT);
    const response = await edge.fetch(request, {} as any, {} as any);
    expect(response).toBeInstanceOf(Response);
  });

  it("should return 404 for unknown path", async () => {
    const request = new Request(`${API_ENDPOINT}/unknown-route`);
    const response = await edge.fetch(request, {} as any, {} as any);
    expect(response.status).toBe(404);
  });
});
