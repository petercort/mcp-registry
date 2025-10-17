import fs from "fs";
import path from "path";
import { env } from "../config/env";
import { createDatabase } from "../db";
import { getValidator } from "../schemas/openapi";
import { RegistryService } from "../services/registry-service";
import type { ServerDetail } from "../types/registry";
import { validateWithSchema } from "../utils/validation";

const [, , fileArg] = process.argv;
const inputPath = fileArg
  ? path.resolve(process.cwd(), fileArg)
  : path.resolve(process.cwd(), "registry.json");

if (!fs.existsSync(inputPath)) {
  console.error(`Seed file not found at ${inputPath}`);
  process.exit(1);
}

const rawPayload = fs.readFileSync(inputPath, "utf-8");
let payload: unknown;

try {
  payload = JSON.parse(rawPayload);
} catch (error) {
  console.error(`Failed to parse JSON from ${inputPath}: ${(error as Error).message}`);
  process.exit(1);
}

if (!Array.isArray(payload)) {
  console.error("Seed file must contain an array of server entries");
  process.exit(1);
}

const database = createDatabase(env.databasePath);
const registry = new RegistryService(database);
const serverValidator = getValidator("serverDetail");

let successCount = 0;

for (const [index, entry] of payload.entries()) {
  try {
    const detail = validateWithSchema<ServerDetail>(
      serverValidator,
      entry,
      `Seed item at index ${index} failed schema validation`,
    );
    registry.publish(detail);
    successCount += 1;
    console.info(`Imported ${detail.name}@${detail.version}`);
  } catch (error) {
    console.error(`Failed to import seed item at index ${index}: ${(error as Error).message}`);
  }
}

database.close();
console.info(`Imported ${successCount} of ${payload.length} server entries`);

