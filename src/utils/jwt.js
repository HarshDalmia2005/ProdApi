import jwt from "jsonwebtoken";
import logger from "../config/logger.js";

const JWT_SECERET = process.env.JWT_SECERET || "your-secret-key";
const JWT_EXPIRES_IN = "1d";

export const jwttoken = {
  sign: (payload) => {
    try {
      return jwt.sign(payload, JWT_SECERET, { expiresIn: JWT_EXPIRES_IN });
    } catch (error) {
      logger.error("Failed to authenticate token", error);
      throw new Error("Failed to authenticate token");
    }
  },

  verify: (token) => {
    try {
      return jwt.verify(token, JWT_SECERET);
    } catch (error) {
      logger.error("Failed to authenticate token", error);
      throw new Error("Failed to authenticate token");
    }
  },
};
