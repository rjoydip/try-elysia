import { type ElysiaConfig } from "elysia";
import NonError from "non-error";
import { isProduction } from "std-env";
import stripAnsi from "strip-ansi";
import { Logger, type ILogObj } from "tslog";

export const API_PREFIX = `/api`;
export const AUTH_PREFIX = `${API_PREFIX}/auth/*`;
export const API_NAME = "TRY ELYSIA";
const _isBrowser = globalThis.window?.document !== undefined;

const _getFilePathForLog = () =>
  _isBrowser ? "" : `[${isProduction ? "{{filePathWithLine}}" : "{{filePathWithLine}}"}]`;

export const logger: Logger<ILogObj> = new Logger({
  name: API_NAME,
  type: "pretty",
  prettyLogTemplate: `{{dateIsoStr}} {{logLevelName}} ${_getFilePathForLog()}`,
  prettyLogTimeZone: "UTC",
  stylePrettyLogs: true,
  prettyLogStyles: {
    logLevelName: {
      "*": ["bold", "black", _isBrowser ? "bgCyanBright" : "bgWhiteBright", "dim"],
      SILLY: ["bold", "cyan"],
      TRACE: ["bold", "cyanBright"],
      DEBUG: ["bold", "green"],
      INFO: ["bold", "blue"],
      WARN: ["bold", "yellow"],
      ERROR: ["bold", "red"],
      FATAL: ["bold", "redBright"],
    },
    dateIsoStr: _isBrowser ? ["cyan", "bold"] : "cyan",
    filePathWithLine: "cyan",
    name: ["cyan", "bold"],
    nameWithDelimiterPrefix: ["cyan", "bold"],
    nameWithDelimiterSuffix: ["cyan", "bold"],
    errorName: ["bold", "redBright"],
    fileName: ["yellow"],
  },
  overwrite: {
    transportFormatted: (logMetaMarkup, logArgs, logErrors) => {
      const logLevel = logMetaMarkup.trim().split("\t")[1];
      switch (logLevel) {
        case "WARN":
          console.warn(logMetaMarkup.trim(), ...logArgs, ...logErrors);
          break;
        case "ERROR":
        case "FATAL": {
          const formattedErrors = logErrors.map((i) => {
            const withoutErrorSuffixer = i.replace("Error ", "").trim();
            return _isBrowser
              ? new NonError(stripAnsi(withoutErrorSuffixer.replaceAll("error stack:", "")).trim())
                  .value
              : withoutErrorSuffixer;
          });
          console.error(logMetaMarkup.trim(), ...logArgs, ...formattedErrors);
          break;
        }
        case "INFO":
          console.info(logMetaMarkup.trim(), ...logArgs, ...logErrors);
          break;
        default:
          console.log(logMetaMarkup.trim(), ...logArgs, ...logErrors);
      }
    },
  },
});

export const appConfig: ElysiaConfig<any> = {
  normalize: true,
  prefix: "",
  nativeStaticResponse: true,
  websocket: {
    idleTimeout: 30,
  },
};

export const rateLimitConfig = {
  duration: 60_000,
  max: 100,
};
