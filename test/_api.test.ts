import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { api as baseAPI, type API } from "~/_api";
import { API_NAME, API_PREFIX } from "~/_config";
import { API_ENDPOINT } from "./_test_utils";

describe("API", () => {
  let ws: WebSocket;
  const app = baseAPI;
  const rpc_api = treaty<API>(app);

  beforeAll(() => {
    app.listen(0);
    const port = app.server?.port;

    if (!port) throw new Error("Server failed to start");

    ws = new WebSocket(`ws://localhost:${port}${API_PREFIX}/chat`);
  });

  afterAll(() => {
    ws.close();
    app.stop(true);
  });

  it("should return a welcome message", async () => {
    const welcome_message = `Welcome to (🦊) ${API_NAME}`;

    const response = await app.handle(new Request(API_ENDPOINT));
    const response_text = await response.text();

    const { data } = await rpc_api.api.get();

    expect(data).toBe(welcome_message);
    expect(response_text).toBe(welcome_message);
  });

  it("should return health check", async () => {
    const healthDetails = {
      name: API_NAME,
    };

    const response = await app.handle(new Request(`${API_ENDPOINT}/health`));
    const response_text = await response.text();

    const { data } = await rpc_api.api.health.get();

    expect(data).toEqual(healthDetails);
    expect(response_text).toEqual(JSON.stringify(healthDetails));
  });

  it("should return ssr message", async () => {
    const { data, error } = await rpc_api.api.sse.get();

    if (error) {
      expect(error).toBeUndefined();
    } else {
      for await (const chunk of data) {
        expect(typeof chunk).toBe("object");
        expect(chunk).toHaveProperty("data");
      }
    }
  });

  it("should handle unauthorized WebSocket connection", async () => {
    const messages: { id: string; message: string }[] = [];

    ws.addEventListener("message", ({ data }) => {
      messages.push(data);
    });

    await new Promise<void>((resolve) => {
      ws.addEventListener("open", () => resolve());
    });

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(messages.length).toBe(1);
    expect(JSON.parse(messages[0].toString())).toMatchObject({
      id: expect.any(String),
      message: "Unauthorized",
    });
  });
});
