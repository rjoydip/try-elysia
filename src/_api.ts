import { Elysia, t } from "elysia";
import { API_VERSION, API_NAME, logger } from "./_config";

const baseAPI = new Elysia({})
  .state("version", API_VERSION)
  .state("name", API_NAME)
  .ws("/chat", {
    body: t.String(),
    response: t.String(),
    async open(ws) {
      logger.info("WebSocket connection opened");

      /* const session = (ws.data as any).session ?? null;

      if (!session) {
        ws.close(1008, "Unauthorized");
      } */

      ws.send("Welcome");
    },
    message(ws, message) {
      ws.send(message);
    },
  })
  .get("/meta", ({ store: { version, name } }) => ({ version, name }))
  .get("/", ({ store: { name }, set }) => {
    set.headers["Content-Type"] = "text/plain; charset=utf-8";
    return `Welcome to (🦊) ${name}`;
  });

export default baseAPI;
export type BaseAPI = typeof baseAPI;
