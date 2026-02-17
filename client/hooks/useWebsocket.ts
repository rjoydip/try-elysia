import { v4 as secure } from "@lukeed/uuid/secure";
import { useState, useEffect, useRef } from "react";
import { logger } from "~/_config";
import { RpcApi } from "~/client/api";

type WSPayload = {
  id: string;
  message: string;
};

const useWebSocket = (rpc_api: RpcApi) => {
  const chat = rpc_api.api.chat.subscribe();
  const [message, setMessage] = useState<WSPayload | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Open connection
    chat.on("open", (message) => {
      setIsConnected(true);
      logger.info("🦊 Elysia socket is open 🦊", message);
      setMessage(message as unknown as WSPayload);
      chat.send({ id: secure(), message: "🦊 Elysia socket is open 🦊" });
    });

    chat.on("close", (message) => {
      logger.info("🦊 Elysia socket is closed 🦊", message);
    });

    chat.on("error", (message) => {
      logger.info("🦊 Elysia socket is error 🦊", message);
    });

    // Cleanup function to close the connection when the component unmounts
    return () => {
      chat.close();
    };
  }, []); // Re-run effect if URL changes

  const sendMessage = (message: string) => {
    if (socketRef.current && isConnected) {
      chat.send({ id: secure(), message });
    }
  };

  return { message, isConnected, sendMessage };
};

export default useWebSocket;
