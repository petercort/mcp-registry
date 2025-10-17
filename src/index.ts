import { env } from "./config/env";
import { buildApp } from "./app";

const start = async () => {
  const app = buildApp();
  try {
    await app.listen({ port: env.port, host: "0.0.0.0" });
    app.log.info(`MCP registry API listening on http://0.0.0.0:${env.port}`);
  } catch (error) {
    app.log.error({ err: error }, "Failed to start server");
    process.exit(1);
  }
};

void start();

