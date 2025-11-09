import aj from "../config/arcjet.js";
import { slidingWindow } from "@arcjet/node";
import logger from "../config/logger.js";

export const securityMiddleware = async (req, res, next) => {
  try {
    const role = req.user?.role || "guest";

    let limit;
    let message;

    switch (role) {
      case "admin":
        limit = 100;
        message = "Admin rate limit ( 100 per minute ) exceeded";
        break;
      case "user":
        limit = 20;
        message = "User rate limit ( 10 per minute ) exceeded";
        break;
      case "guest":
        limit = 5;
        message = "Guest rate limit (5 per minute ) exceeded";
        break;
    }

    const client = aj.withRule(
      slidingWindow({
        mode: "LIVE",
        interval: "1m",
        max: limit,
        name: `${role}-rate-limit`,
      })
    );

    const desc = await client.protect(req);
    if (desc.isDenied() && desc.reason.isBot()) {
      logger.warn(`Blocked bot request`, {
        ip: req.ip,
        path: req.path,
        userAgent: req.headers["user-agent"],
      });
      return res
        .status(403)
        .json({ error: "Forbidden", message: "Access denied for bots" });
    }

    if (desc.isDenied() && desc.reason.isShield()) {
      logger.warn(`Shield blocked request`, {
        ip: req.ip,
        path: req.path,
        userAgent: req.headers["user-agent"],
        method: req.method,
      });
      return res
        .status(403)
        .json({ error: "Forbidden", message: "Request Blocked by security" });
    }

    if (desc.isDenied() && desc.reason.isRateLimit()) {
      logger.warn(`Rate Limit Exceeded`, {
        ip: req.ip,
        path: req.path,
        userAgent: req.headers["user-agent"],
      });
      return res
        .status(403)
        .json({ error: "Forbidden", message: "Too many Requests" });
    }

    next();
  } catch (error) {
    console.error("Security Middleware Error:", error);
    res.status(500).json({
      error: "Internal Server error",
      message: "Something went wrong while processing your request.",
    });
  }
};

export default securityMiddleware;
