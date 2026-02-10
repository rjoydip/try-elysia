import { treaty } from "@elysiajs/eden";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { logger } from "../src/_config";
import { BaseAPI } from "../src/_api";

import "./global.css";
const rpc_api = treaty<BaseAPI>("localhost:3000");
const chat = rpc_api.chat.subscribe();

function App() {
  logger.info("🦊 TRY ELYSIA Frontend 🦊");

  const [incomingMessage, setIncomingMessage] = useState("🦊 TRY ELYSIA Frontend 🦊");

  chat.subscribe((message) => {
    logger.info("Received message:", message.data);
    setIncomingMessage(message.data);
  });

  chat.on("open", (message) => {
    logger.info("🦊 Elysia socket is open 🦊", message);
    chat.send("🦊 Elysia socket is open 🦊");
  });

  chat.on("close", (message) => {
    logger.info("🦊 Elysia socket is closed 🦊", message);
    chat.close();
  });

  chat.on("error", (message) => {
    logger.info("🦊 Elysia socket is error 🦊", message);
    chat.close();
  });

  return (
    <main>
      <h2>{incomingMessage}</h2>
    </main>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
