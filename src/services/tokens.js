import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signAuthToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      roles: user.roles,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
}

export function verifyAuthToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}
