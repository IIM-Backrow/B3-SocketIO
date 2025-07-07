import { createLogger, format, transports, Logger } from "winston";

/**
 * Create a logger for a specific feature
 * @param feature - The name of the feature to create a logger for
 * @returns A logger for the feature
 */
const createFeatureLogger = (feature?: string): Logger => {
  const baseFormat = format.combine(format.timestamp(), format.errors({ stack: true }), format.json());

  const consoleFormat = format.combine(
    format.timestamp({ format: "HH:mm:ss" }),
    format.colorize(),
    format.printf(({ timestamp, level, message, feature: logFeature, ...meta }) => {
      const featurePrefix = logFeature ? `[${logFeature}] ` : "";
      const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
      return `${timestamp} ${level}: ${featurePrefix}${message}${metaStr}`;
    })
  );

  const logger = createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: baseFormat,
    defaultMeta: feature ? { feature } : {},
    transports: [
      new transports.Console({
        format: consoleFormat
      })
    ]
  });

  return logger;
};

const logger = createFeatureLogger();

export default logger;
export { createFeatureLogger };
