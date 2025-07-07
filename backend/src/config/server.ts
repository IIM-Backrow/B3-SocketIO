export const SERVER_CONFIG = {
  port: parseInt(process.env.PORT || "3000", 10),
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
  },
  env: process.env.NODE_ENV || "development"
} as const;

export const isProduction = SERVER_CONFIG.env === "production";
export const isDevelopment = SERVER_CONFIG.env === "development";
