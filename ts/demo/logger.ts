import winston, { format, Logger } from "winston";
const { combine, printf, label, timestamp } = format;

const logFormat = printf(({ level, message, label, timestamp }) => {
  return `[${timestamp}] [${label}] ${level}: ${message}`;
});

export const getLogger = (prefix: string): Logger => {
  const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
    format: combine(
      label({ label: prefix.toUpperCase() }),
      timestamp({ format: "M/D/YY HH:mm:ss" }),
      logFormat
    ),
  });

  return logger;
};
