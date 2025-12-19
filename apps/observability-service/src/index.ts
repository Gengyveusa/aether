import Fastify from "fastify";
import { logger } from "@aether/shared-utils";

const app = Fastify({ logger: false });

// TODO: expose Prometheus metrics, tracing health, etc.
app.get("/metrics", async () => {
  return "# metrics stub\n";
});

app.get("/health", async () => ({ status: "ok" }));

const port = Number(process.env.PORT ?? 3004);
const host = process.env.HOST ?? "0.0.0.0";

app
  .listen({ port, host })
  .then(() => logger.info("observability-service listening", { port, host }))
  .catch((err) => {
    logger.error("observability-service failed to start", { err: String(err) });
    process.exit(1);
  });
