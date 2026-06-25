export function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 503;
  const isConnectionError =
    error.code === "ECONNREFUSED" ||
    error.code === "ER_ACCESS_DENIED_ERROR" ||
    error.code === "ER_BAD_DB_ERROR" ||
    error.code === "ENOTFOUND";

  if (isConnectionError) {
    return res.status(503).json({
      success: false,
      connected: false,
      message: "Unable to connect to MySQL. Check your credentials.",
    });
  }

  res.status(statusCode).json({
    success: false,
    connected: false,
    message: error.statusCode ? error.message : "Unable to discover schema.",
  });
}
