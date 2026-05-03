import { logger } from "./pino";
import { pinoHttp } from "pino-http";

export const httpLogger = pinoHttp({
  logger,
  customLogLevel: function(req, res, err) {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn'
    } else if (res.statusCode >= 500 || err) {
      return 'error'
    }
    return 'info'
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      authorization: req.headers.authorization ? 'Bearer ***' : undefined,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
  customSuccessMessage: function(req, res) {
    return `${req.method} ${req.url} ${res.statusCode}`
  },
  customErrorMessage: function(req, res, err) {
    return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`
  }
})

