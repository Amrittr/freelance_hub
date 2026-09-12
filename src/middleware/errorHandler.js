export function notFound(_req, _res, next) {
  const error = new Error("Route not found.");
  error.statusCode = 404;
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  if (error.name === "CastError") {
    error.statusCode = 400;
    error.message = "Invalid identifier.";
  }

  if (error.code === 11000) {
    error.statusCode = 409;
    error.message = "A record with these details already exists.";
  }

  if (error.name === "ValidationError") {
    error.statusCode = 400;
    error.message = "Invalid data.";
  }

  const status = error.statusCode || error.status || 500;
  const payload = {
    error: {
      message: status === 500 ? "Internal server error." : error.message,
    },
  };

  if (error.details) {
    payload.error.details = error.details;
  }

  if (process.env.NODE_ENV !== "production" && status === 500) {
    payload.error.debug = error.message;
  }

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json(payload);
}
