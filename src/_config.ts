import { type ElysiaConfig } from "elysia";
import NonError from "non-error";
import { isBun, isProduction } from "std-env";
import stripAnsi from "strip-ansi";
import { Logger, type ILogObj } from "tslog";

export const API_PREFIX = `/api`;
export const AUTH_PREFIX = `${API_PREFIX}/auth/*`;
export const API_NAME = "TRY ELYSIA";
export const APP_NAME = API_NAME;
export const CLIENT_PATH = isBun ? `./client` : `./dist`;
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
            if (_isBrowser) {
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
  normalize: true,
  prefix: "",
  nativeStaticResponse: true,
  websocket: {
    idleTimeout: 30,
  },
};
