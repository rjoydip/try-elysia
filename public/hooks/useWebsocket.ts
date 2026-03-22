import { v4 as secure } from "@lukeed/uuid/secure";
import { useState, useEffect } from "react";
import { logger } from "~/_config";
import { type RpcApi } from "~/public/api";

type WSPayload = {
  id: string;
  message: string;
};

const useWebSocket = (rpc_api: RpcApi) => {
  const chat = rpc_api.api.chat.subscribe();
  const [message, setMessage] = useState<WSPayload | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    chat.on("open", (msg) => {
      setIsConnected(true);
      logger.info("🦊 Elysia socket is open 🦊", msg);
      setMessage(msg as unknown as WSPayload);
      chat.send({ id: secure(), message: "🦊 Elysia socket is open 🦊" });
    });

    chat.on("close", (msg) => {
      setIsConnected(false);
      logger.info("🦊 Elysia socket is closed 🦊", msg);
    });

    chat.on("error", (msg) => {
      logger.info("🦊 Elysia socket is error 🦊", msg);
    });

    return () => {
      chat.close();
    };
  }, []);

  const sendMessage = (msg: string) => {
    if (isConnected) {
      chat.send({ id: secure(), message: msg });
    }
  };

  return { message, isConnected, sendMessage };
};

export default useWebSocket;
