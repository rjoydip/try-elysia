import { v4 as secure } from "@lukeed/uuid/secure";
import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { api as baseAPI, type API as BaseAPI } from "~/api";
import { API_NAME, API_PREFIX } from "~/_config";
import { API_ENDPOINT } from "./_test_utils";

describe("API", () => {
  let ws: WebSocket;
  const app = baseAPI;
  const rpc_api = treaty<BaseAPI>(app);

  beforeAll(() => {
    app.listen(0);
    // Listen on port 0 to let the OS assign a random available port
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

  it("should return metadata", async () => {
    const metadata = {
      name: API_NAME,
    };

    const response = await app.handle(new Request(`${API_ENDPOINT}/meta`));
    const response_text = await response.text();

    const { data } = await rpc_api.api.meta.get();

    expect(data).toEqual(metadata);
    expect(response_text).toEqual(JSON.stringify(metadata));
  });

  it("should return ssr message", async () => {
    // const response = await app.handle(new Request(`${API_ENDPOINT}/sse`));
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

  it("should handle connection and messages", async () => {
    // Capture received messages
    const messages: { id: string; message: string }[] = [];
    ws.addEventListener("message", ({ data }) => {
      messages.push(data);
    });

    // Wait for connection to open
    await new Promise<void>((resolve) => {
      ws.addEventListener("open", () => resolve());
    });

    // Wait for the welcome message (sent on open)
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(messages.length).toBe(1);
    expect(JSON.parse(messages[0].toString())).toMatchObject({
      id: expect.any(String),
      message: "Welcome",
    });

    // Send a test message
    ws.send(JSON.stringify({ id: secure(), message: "Hello Elysia" }));

    // Wait for the echo response
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(messages.length).toBe(2);
    expect(JSON.parse(messages[1].toString())).toMatchObject({
      id: expect.any(String),
      message: "Hello Elysia",
    });
  });
});
