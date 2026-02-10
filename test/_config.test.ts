import { describe, expect, it } from "bun:test";
import { Logger } from "tslog";
import {
  API_NAME,
  API_PREFIX,
  API_VERSION,
  appConfig,
  DEFAULT_PORT,
  logger,
  PORT,
} from "../src/_config";
import { isWorkerd } from "std-env";

describe("Config", () => {
  it("should export correct constants", () => {
    expect(API_VERSION).toBe("v1");
    expect(API_PREFIX).toBe("/api");
    expect(API_NAME).toBe("TRY ELYSIA");
  });

  it("should export default PORT number", () => {
    expect(DEFAULT_PORT).not.toBeUndefined();
    expect(typeof DEFAULT_PORT).toBe("number");
    if (isWorkerd) {
      expect(DEFAULT_PORT).toBe(8787);
    } else {
      expect(DEFAULT_PORT).toBe(3000);
    }
  });

  it("should export a configured logger", () => {
    expect(logger).toBeInstanceOf(Logger);
    expect(logger.settings.name).toBe(API_NAME);
    expect(logger.settings.type).toBe("pretty");
  });

  it("should validate PORT number", () => {
    expect(PORT).not.toBeUndefined();
    expect(typeof PORT).toBe("number");

    if (isWorkerd) {
      expect(PORT).toBe(8787);
    } else {
      expect(PORT).toBe(3000);
    }
  });

  it("should export correct appConfig", () => {
    expect(appConfig).toEqual({
      prefix: "/api/v1",
      normalize: true,
      nativeStaticResponse: true,
      websocket: {
        idleTimeout: 30,
      },
    });
  });
});
