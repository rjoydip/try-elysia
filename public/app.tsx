import { useState } from "react";
import { logger } from "~/_config";
import { rpc_api, useQuery } from "~/public/api";
// import useWebSocket from "~/client/hooks/useWebsocket";

export function App() {
  logger.info("🦊 TRY ELYSIA Frontend App 🦊");
  const [incomingMessage] = useState("🦊 TRY ELYSIA Frontend 🦊");

  const { isPending, isError, data, error } = useQuery(
    ["fetchUsers"],
    async () => {
      return rpc_api.api.user.get();
    },
    {},
  );

  // const wsMessage = useWebSocket(rpc_api);
  // console.log(wsMessage);

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
