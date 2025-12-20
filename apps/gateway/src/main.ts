import "reflect-metadata";

import { NestFactory } from "@nestjs/core";
import { config } from "@aether/shared-utils";
import { AppModule } from "./modules/app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ["log", "error", "warn"] });

  const port = config.gateway.port;
  const host = process.env.HOST ?? "0.0.0.0";

  await app.listen(port, host);
}

void bootstrap();
