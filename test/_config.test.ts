import { describe, expect, it } from "bun:test";
import { Logger } from "tslog";
import { API_NAME, API_PREFIX, appConfig, AUTH_PREFIX, logger, rateLimitConfig } from "~/_config";

describe("Config", () => {
  it("should export correct constants", () => {
    expect(API_PREFIX).toBe("/api");
    expect(AUTH_PREFIX).toBe("/api/auth/*");
    expect(API_NAME).toBe("TRY ELYSIA");
  });

  it("should export a configured logger", () => {
    expect(logger).toBeInstanceOf(Logger);
    expect(logger.settings.name).toBe(API_NAME);
    expect(logger.settings.type).toBe("pretty");
  });

  it("should export correct appConfig", () => {
    expect(appConfig).toEqual({
      normalize: true,
      prefix: "",
      nativeStaticResponse: true,
      websocket: {
        idleTimeout: 30,
      },
    });
  });

  it("should export rateLimitConfig", () => {
    expect(rateLimitConfig).toEqual({
      duration: 60_000,
      max: 100,
    });
  });
});
