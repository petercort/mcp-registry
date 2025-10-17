import path from "path";
import { config as loadEnv } from "dotenv";

loadEnv();

const DEFAULT_DB_PATH = path.resolve(process.cwd(), "data", "registry.sqlite");

export interface AppConfig {
  nodeEnv: string;
  port: number;
  databasePath: string;
  publishToken: string | null;
}

const rawPort = process.env.PORT ?? "3000";
const parsedPort = Number.parseInt(rawPort, 10);

if (Number.isNaN(parsedPort) || parsedPort <= 0) {
  throw new Error(`Invalid PORT value "${rawPort}". PORT must be a positive integer.`);
}

export const env: AppConfig = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parsedPort,
  databasePath: process.env.DATABASE_PATH
    ? path.resolve(process.cwd(), process.env.DATABASE_PATH)
    : DEFAULT_DB_PATH,
  publishToken: process.env.REGISTRY_PUBLISH_TOKEN ?? null,
};

