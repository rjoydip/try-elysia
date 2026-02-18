import { Link } from "@tanstack/react-router";

export function NotFound() {
  return (
    <div className="space-y-2 p-2">
      <p>The page you are looking for does not exist.</p>
      <p className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => window.history.back()}>
          Go back
        </button>
        <button>
          <Link to="/">Home</Link>
        </button>
      </p>
    </div>
  );
}
