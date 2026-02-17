/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `public/index.html`.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { QueryClientProvider, QueryErrorResetBoundary } from "@tanstack/react-query";
import { queryClient } from "~/client/query";
import { App } from "~/client/app";

import "~/client/index.css";

const app = (
  <StrictMode>
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
    </QueryClientProvider>
  </StrictMode>
);

const root = createRoot(document.getElementById("root")!);
root.render(app);
