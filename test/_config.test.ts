import { describe, expect, it } from "bun:test";
import { Logger } from "tslog";
import { API_NAME, API_PREFIX, appConfig, AUTH_PREFIX, CLIENT_PATH, logger } from "~/_config";

describe("Config", () => {
  it("should export correct constants", () => {
    expect(API_PREFIX).toBe("/api");
    expect(AUTH_PREFIX).toBe("/api/auth/*");
    expect(API_NAME).toBe("TRY ELYSIA");
    expect(CLIENT_PATH).toContain("client");
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
});
