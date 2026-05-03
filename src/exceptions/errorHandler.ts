import ApiError from "./apiError";
import { logger } from "../infra/logger/pino";
import type { Request, Response } from "express"

const erorrHandler = (err: any, req: Request, res: Response) => {
  // Handle ApiError
  if (err instanceof ApiError) {
    logger.error({
      type: 'ApiError',
      status: err.status,
      message: err.message,
      path: req.path
    });

    return res.status(err.status).json({
      success: false,
      message: err.message,
    });
  }

  // Handle JWT errors (shouldn't reach here if middleware is fixed, but just in case)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    logger.error({
      type: 'JWTError',
      name: err.name,
      message: err.message
    });

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    logger.error({
      type: 'ValidationError',
      errors: err.errors
    });

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors
    });
  }

  // Generic errors
  logger.error({
    type: 'UnhandledError',
    name: err.name,
    message: err.message,
    stack: err.stack
  });

  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
}

export default erorrHandler;
