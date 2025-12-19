import Fastify from "fastify";
import { z } from "zod";
import { logger } from "@aether/shared-utils";

const app = Fastify({ logger: false });

const SemanticSearchRequestSchema = z.object({
  query: z.string().min(1),
  entityScope: z.array(z.string()).optional()
});

const AnswerRequestSchema = z.object({
  query: z.string().min(1),
  entityId: z.string().optional()
});

// TODO: inject a vector store client

app.post("/semantic-search", async (req, reply) => {
  const parsed = SemanticSearchRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: "Invalid request", details: parsed.error.flatten() });
  }

  return {
    query: parsed.data.query,
    chunks: [
      {
        id: "chunk_1",
        text: "Placeholder chunk. Vector store integration pending.",
        score: 0.42
      }
    ]
  };
});

app.post("/answer", async (req, reply) => {
  const parsed = AnswerRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: "Invalid request", details: parsed.error.flatten() });
  }

  return {
    answer: "Placeholder answer. RAG generation pending.",
    citations: []
  };
});

const port = Number(process.env.PORT ?? 3002);
const host = process.env.HOST ?? "0.0.0.0";

app
  .listen({ port, host })
  .then(() => logger.info("rag-service listening", { port, host }))
  .catch((err) => {
    logger.error("rag-service failed to start", { err: String(err) });
    process.exit(1);
  });
