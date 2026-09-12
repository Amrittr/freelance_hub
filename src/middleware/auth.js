import { User } from "../models/User.js";
import { verifyAuthToken } from "../services/tokens.js";
import { asyncHandler } from "./asyncHandler.js";

export const attachUser = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.fh_token;
  if (!token) {
    return next();
  }

  try {
    const payload = verifyAuthToken(token);
    const user = await User.findById(payload.sub);
    if (user) {
      req.user = user;
    }
  } catch {
    req.user = null;
  }

  return next();
});

export function requireAuth(req, _res, next) {
  if (!req.user) {
    const error = new Error("Authentication required.");
    error.statusCode = 401;
    return next(error);
  }
  return next();
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      const error = new Error("Authentication required.");
      error.statusCode = 401;
      return next(error);
    }

    const hasRole = roles.some((role) => req.user.roles.includes(role));
    if (!hasRole) {
      const error = new Error("You do not have permission to perform this action.");
      error.statusCode = 403;
      return next(error);
    }

    return next();
  };
}
