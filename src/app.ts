import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import compression from "compression";
import hpp from "hpp";
import logger from "./utils/logger";
import { xssSanitizerMiddleware } from "./app/middlewares/sanitizeInput";
import helmetMiddleware from "./app/middlewares/helmetMiddleware";
import { validateContentType } from "./app/middlewares/contentTypeValidator";
import { csrfMiddleware, validateCsrf } from "./app/middlewares/csrfProtection";
import GlobalErrorHandler from "./app/middlewares/globalErrorHandler";
import config from "./config";
import router from "./app/routes";
import { CustomError } from "./interfaces";
import { logSecurityEvent } from "./utils/auditLogger";
import { rateLimiter } from "./app/middlewares/rate_limiter";

// =======================
// Express App Setup
// =======================
const app: Application = express();

// =======================
// CORS Setup
// =======================
const allowedOrigins = config.cors_origin;

const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["content-type", "Authorization", "x-api-key"],
  credentials: true,
};

app.set("trust proxy", 1);

// =======================
// Middleware
// =======================
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(helmetMiddleware());
app.use(hpp());
app.use(compression());
app.use(xssSanitizerMiddleware);
app.use(express.static("public"));



app.use((req, res, next) => {
  if (req.is("multipart/form-data")) return next(); 
  express.json({ limit: "10mb" })(req, res, next);
});



// Validate content type for non-GET requests
app.use((req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  validateContentType(req, res, next);
});

// API KEY Validation Middleware
app.use((req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  const validApiKeys = config.jwt.api_keys;
  if (apiKey && validApiKeys.includes(apiKey as string)) {
    return next();
  } else {
    return res
      .status(httpStatus.UNAUTHORIZED)
      .json({ success: false, message: "Invalid API Key" });
  }
});

// =======================
// CSRF Protection
// =======================
app.use((req, res, next) => {
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return validateCsrf(req, res, next);
  }
  next();
});

app.use(csrfMiddleware);

app.get("/api/v1/csrf-token", csrfMiddleware, (req: Request, res: Response) => {
  res.send({
    success: true,
    csrfToken: res.locals.csrfToken,
  });
});

// =======================
// Slow Request Monitoring
// =======================
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (duration > 1000) {
      logger.warn(`Slow request detected: ${req.method} ${req.originalUrl}`, {
        duration,
      });
    }
  });
  next();
});

// =======================
// Routes
// =======================
app.get("/", (req: Request, res: Response) => {
  res.send({ message: "Welcome to the API" });
});

app.use(`${config.url.end_point_prefix}`, rateLimiter(100), router);

// Health check
app.get(
  `${config.url.end_point_prefix}/health`,
  (req: Request, res: Response) => {
    res.status(httpStatus.OK).json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      apiVersion: "v1",
    });
  },
);

// =======================
// CSRF Error Handler
// =======================
app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
  if (err.code === "EBADCSRFTOKEN") {
    logSecurityEvent("Invalid CSRF token", {
      path: req.originalUrl,
      ip: req.ip,
    });
    return res
      .status(403)
      .json({ success: false, message: "Invalid CSRF token" });
  }
  return next(err);
});

// =======================
// Global Error Handler
// =======================
app.use(GlobalErrorHandler);

// =======================
// 404 Handler
// =======================
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;
