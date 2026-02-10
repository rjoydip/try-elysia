import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { treaty } from "@elysiajs/eden";
import baseAPI, { BaseAPI } from "../src/_api";
import { API_NAME, API_VERSION } from "../src/_config";

describe("API", () => {
  let ws: WebSocket;
  const app = new Elysia().use(baseAPI);
  const rpc_api = treaty<BaseAPI>(app);

  beforeAll(() => {
    app.listen(0);
    // Listen on port 0 to let the OS assign a random available port
    const port = app.server?.port;

    if (!port) throw new Error("Server failed to start");

    ws = new WebSocket(`ws://localhost:${port}/chat`);
  });

  afterAll(() => {
    ws.close();
    app.stop(true);
  });

  it("should return a welcome message", async () => {
    const welcome_message = `Welcome to (🦊) ${API_NAME}`;

    const response = await app.handle(new Request("http://localhost/"));
    const response_text = await response.text();

    const { data } = await rpc_api.get();

    expect(data).toBe(welcome_message);
    expect(response_text).toBe(welcome_message);
  });

  it("should return metadata", async () => {
    const metadata = {
      version: API_VERSION,
      name: API_NAME,
    };

    const response = await app.handle(new Request("http://localhost/meta"));
    const response_text = await response.text();

    const { data } = await rpc_api.meta.get();

    expect(data).toEqual(metadata);
    expect(response_text).toEqual(JSON.stringify(metadata));
  });

  it("should handle connection and messages", async () => {
    // Capture received messages
    const messages: string[] = [];
    ws.addEventListener("message", (event) => {
      messages.push(event.data.toString());
    });

    // Wait for connection to open
    await new Promise<void>((resolve) => {
      ws.addEventListener("open", () => resolve());
    });

    // Wait for the welcome message (sent on open)
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(messages.length).toBe(1);
    expect(messages).toContain("Welcome");

    // Send a test message
    ws.send("Hello Elysia");

    // Wait for the echo response
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(messages.length).toBe(2);
    expect(messages).toContain("Hello Elysia");
  });
});
