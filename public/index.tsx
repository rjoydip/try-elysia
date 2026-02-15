import { v4 as secure } from "@lukeed/uuid/secure";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider, QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { logger } from "~/_config";
import { rpc_api, useQuery } from "~/public/api";

import "~/public/global.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});

function App() {
  logger.info("🦊 TRY ELYSIA Frontend App 🦊");
  const [incomingMessage] = useState("🦊 TRY ELYSIA Frontend 🦊");

  const { isPending, isError, data, error } = useQuery(
    ["fetchUsers"],
    async () => {
      return rpc_api.api.user.get();
    },
    {},
  );

  useEffect(() => {
    const chat = rpc_api.api.chat.subscribe();
    chat.subscribe(({ data }) => {
      logger.info("Received message:", data);
      queryClient.setQueriesData({ queryKey: ["ws_message"] }, (oldData: any) => {
        const update = (item: any) => (item.id === data.id ? { ...item, ...data } : item);

        if (!oldData) return oldData;
        return Array.isArray(oldData) ? oldData.map(update) : update(oldData);
      });
    });

    chat.on("open", (message) => {
      logger.info("🦊 Elysia socket is open 🦊", message);
      chat.send({ id: secure(), message: "🦊 Elysia socket is open 🦊" });
    });

    chat.on("close", (message) => {
      logger.info("🦊 Elysia socket is closed 🦊", message);
    });

    chat.on("error", (message) => {
      logger.info("🦊 Elysia socket is error 🦊", message);
    });

    return () => {
      chat.close();
    };
  }, []);

  return (
    <>
      <h1>{incomingMessage}</h1>
      {isPending && <span>Loading...</span>}
      {isError && <span>Error: {error instanceof Error ? error.message : String(error)}</span>}
      {data && (
        <>
          <h2>List of users</h2>
          <ul>
            {data.map((user) => (
              <li key={user.id}>{user.name}</li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(
  <QueryClientProvider client={queryClient}>
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ resetErrorBoundary }) => (
            <div>
              There was an error!
              <button onClick={() => resetErrorBoundary()}>Try again</button>
            </div>
          )}
        >
          <App />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  </QueryClientProvider>,
);
