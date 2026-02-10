import { env } from "node:process";
import { isBrowser } from "environment";
import { ElysiaConfig } from "elysia";
import NonError from "non-error";
import { isBun, isProduction, isWorkerd } from "std-env";
import stripAnsi from "strip-ansi";
import { Logger, ILogObj } from "tslog";

export const API_VERSION = "v1";
export const API_PREFIX = "/api";
export const DEFAULT_PORT = isWorkerd ? 8787 : 3000;
export const API_NAME = "TRY ELYSIA";

export const PORT = isBun ? Bun.env.PORT || DEFAULT_PORT : env.PORT || DEFAULT_PORT;

const _getFilePathForLog = () =>
  isBrowser ? "" : `[${isProduction ? "{{filePathWithLine}}" : "{{filePathWithLine}}"}]`;

export const logger: Logger<ILogObj> = new Logger({
  name: API_NAME,
  type: "pretty",
  prettyLogTemplate: `{{dateIsoStr}} {{logLevelName}} ${_getFilePathForLog()}`,
  prettyLogTimeZone: "UTC",
  stylePrettyLogs: true,
  prettyLogStyles: {
    logLevelName: {
      "*": ["bold", "black", isBrowser ? "bgCyanBright" : "bgWhiteBright", "dim"],
      SILLY: ["bold", "cyan"],
      TRACE: ["bold", "cyanBright"],
      DEBUG: ["bold", "green"],
      INFO: ["bold", "blue"],
      WARN: ["bold", "yellow"],
      ERROR: ["bold", "red"],
      FATAL: ["bold", "redBright"],
    },
    dateIsoStr: isBrowser ? ["cyan", "bold"] : "cyan",
    filePathWithLine: "cyan",
    name: ["cyan", "bold"],
    nameWithDelimiterPrefix: ["cyan", "bold"],
    nameWithDelimiterSuffix: ["cyan", "bold"],
    errorName: ["bold", "redBright"],
    fileName: ["yellow"],
  },
  overwrite: {
    transportFormatted: (logMetaMarkup, logArgs, logErrors, logMeta) => {
      const logLevel = logMeta?.logLevelName ?? logMetaMarkup.trim().split("\t")[1];
      switch (logLevel) {
        case "WARN":
          console.warn(logMetaMarkup.trim(), ...logArgs, ...logErrors);
          break;
        case "ERROR":
        case "FATAL":
          const newError = logErrors.map((i) => {
            const withoutErrorSuffixer = i.replace("Error ", "").trim();
            if (isBrowser) {
              const nonError = new NonError(
                stripAnsi(withoutErrorSuffixer.replaceAll("error stack:", "")).trim(),
              );
              return nonError.value;
            } else {
              return withoutErrorSuffixer;
            }
          });
          console.error(logMetaMarkup.trim(), ...logArgs, ...newError);
          break;
        case "INFO":
          console.info(logMetaMarkup.trim(), ...logArgs, ...logErrors);
          break;
        case "DEBUG":
        case "TRACE":
        case "SILLY":
        default:
          console.log(logMetaMarkup.trim(), ...logArgs, ...logErrors);
          break;
      }
    },
  },
});

export const appConfig: ElysiaConfig<any> = {
  prefix: `${API_PREFIX}/${API_VERSION}`,
  normalize: true,
  nativeStaticResponse: true,
  websocket: {
    idleTimeout: 30,
  },
};
