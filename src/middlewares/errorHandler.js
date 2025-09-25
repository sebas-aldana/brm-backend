import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Error interno del servidor";
  const code = err.code || "INTERNAL_SERVER_ERROR";

  logger.error(message, {
    status,
    code,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
    details: err.details || null,
  });

  // Respuesta al cliente
  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
      ...(err.details && { details: err.details }),
    },
  });
};

export default errorHandler;
