import { v4 as secure } from "@lukeed/uuid/secure";
import { t, type TSchema, getSchemaValidator } from "elysia";
import { isBun, isNode, isWorkerd } from "std-env";
import { API_PREFIX } from "~/_config";

export interface EnvOptions {
  server?: Record<string, TSchema>;
  client?: Record<string, TSchema>;
  shared?: Record<string, TSchema>;
  emptyStringAsUndefined?: boolean;
  skipValidation?: boolean;
  extends?: any[];
  isServer?: boolean;
  onValidationError?: (errors: any) => never;
  onInvalidAccess?: (prop: string) => never;
  load?: () => Promise<void> | void;
  runtimeEnv?: () => Record<string, string | undefined>;
}

async function _createEnv(opts: EnvOptions) {
  if (opts.load) {
    await opts.load();
  }

  const _runtimeEnv = typeof opts.runtimeEnv === "function" ? opts.runtimeEnv() : opts.runtimeEnv;
  const runtimeEnv =
    _runtimeEnv ?? (isBun ? Bun.env : typeof process !== "undefined" ? process.env : {});

  const emptyStringAsUndefined = opts.emptyStringAsUndefined ?? false;
  if (emptyStringAsUndefined) {
    for (const [key, value] of Object.entries(runtimeEnv)) {
      if (value === "") {
        delete runtimeEnv[key];
      }
    }
  }

  const skip = !!opts.skipValidation;
  if (skip) {
    if (opts.extends) {
      for (const preset of opts.extends) {
        preset.skipValidation = true;
      }
    }

    return runtimeEnv as any;
  }

  const _client = typeof opts.client === "object" ? opts.client : {};
  const _server = typeof opts.server === "object" ? opts.server : {};
  const _shared = typeof opts.shared === "object" ? opts.shared : {};
  const isServer = opts.isServer ?? (typeof window === "undefined" || "Deno" in window);

  const finalSchemaShape = isServer
    ? {
        ..._server,
        ..._shared,
        ..._client,
      }
    : {
        ..._client,
        ..._shared,
      };

  const schema = getSchemaValidator(t.Object(finalSchemaShape), runtimeEnv);

  if (!schema.Check) {
    const onValidationError =
      opts.onValidationError ??
      ((errors: any) => {
        console.error("❌ Invalid environment variables:", errors);
        throw new Error("Invalid environment variables");
      });
    onValidationError(schema.Errors);
  }

  const onInvalidAccess =
    opts.onInvalidAccess ??
    ((prop: string) => {
      throw new Error(
        `❌ Attempted to access a server-side environment variable "${prop}" on the client`,
      );
    });

  const isServerAccess = (prop: string) => {
    return !(prop in _client) && !(prop in _shared);
  };
  const isValidServerAccess = (prop: string) => {
    return isServer || !isServerAccess(prop);
  };
  const ignoreServerProp = (prop: string) => prop === "__esModule" || prop === "$$typeof";
  const ignoreClientProp = (prop: string) => prop === "then";

  const extendedObj = (opts.extends ?? []).reduce((acc: any, curr: any) => {
    return Object.assign(acc, curr);
  }, {});
  const fullObj = Object.assign(extendedObj, runtimeEnv);

  const env = new Proxy(fullObj, {
    get(target, prop) {
      if (typeof prop !== "string") return undefined;
      if (ignoreServerProp(prop)) return undefined;
      if (ignoreClientProp(prop)) return undefined;
      if (!isValidServerAccess(prop)) return onInvalidAccess(prop);
      return Reflect.get(target, prop);
    },
  });

  return env as Record<string, string | undefined>;
}

const _getEnv = (key: string, defaultValue: string | number = ""): string => {
  const value = isBun
    ? Bun.env[key]
    : typeof process !== "undefined"
      ? process.env?.[key]
      : undefined;
  return value ?? String(defaultValue);
};

const _DEFAULT_PORT = isWorkerd ? 8787 : 3000;
const _BASE_URL = `http://localhost:${_DEFAULT_PORT}`;

export const env = await _createEnv({
  load: async () => {
    if (isNode) {
      await import("dotenv/config");
    }
  },
  client: {
    BASE_URL: t.String(),
  },
  server: {
    API_ENDPOINT: t.String(),
    BETTER_AUTH_SECRET: t.String(),
    BETTER_AUTH_BASE_URL: t.String({ format: "uri" }),
    DATABASE_URL: t.String({ format: "uri" }),
    DATABASE_AUTH_TOKEN: t.String(),
    PORT: t.Number(),
    TLS_CERT_PATH: t.String(),
    TLS_KEY_PATH: t.String(),
  },
  runtimeEnv: () => ({
    BASE_URL: _getEnv("BASE_URL", _BASE_URL),
    API_ENDPOINT: _getEnv("API_ENDPOINT", `${_BASE_URL}${API_PREFIX}`),
    BETTER_AUTH_BASE_URL: _getEnv("BETTER_AUTH_BASE_URL", `${_BASE_URL}${API_PREFIX}`),
    BETTER_AUTH_SECRET: _getEnv("BETTER_AUTH_SECRET", secure()),
    DATABASE_URL: _getEnv("DATABASE_URL", ""),
    DATABASE_AUTH_TOKEN: _getEnv("DATABASE_AUTH_TOKEN", ""),
    PORT: _getEnv("PORT", _DEFAULT_PORT),
    TLS_CERT_PATH: _getEnv("TLS_CERT_PATH", ""),
    TLS_KEY_PATH: _getEnv("TLS_KEY_PATH", ""),
  }),
});

export type Env = ReturnType<typeof _createEnv>;
