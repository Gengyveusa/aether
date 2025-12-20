import type { Entity } from "@aether/shared-types";
import { BrandPolicySchema } from "@aether/shared-types";

import type { GraphServiceClient } from "../clients/graphServiceClient.js";
import type { IngestionServiceClient } from "../clients/ingestionServiceClient.js";
import type { ContentServiceClient } from "../clients/contentServiceClient.js";
import type { RagServiceClient } from "../clients/ragServiceClient.js";

export type OnboardingStep = {
  name: string;
  status: "success" | "skipped" | "failed";
  detail?: string;
};

export type OnboardingResult = {
  entityId: string;
  steps: OnboardingStep[];
};

export async function runOnboardingWorkflow(opts: {
  entityId: string;
  graph: GraphServiceClient;
  ingestion: IngestionServiceClient;
  content: ContentServiceClient;
  rag: RagServiceClient;
}): Promise<OnboardingResult> {
  const steps: OnboardingStep[] = [];

  let entity: Entity | null = null;
  try {
    entity = await opts.graph.getEntity(opts.entityId);
    if (!entity) {
      return { entityId: opts.entityId, steps: [{ name: "fetch_entity", status: "failed", detail: "Entity not found" }] };
    }
    steps.push({ name: "fetch_entity", status: "success" });
  } catch (e) {
    steps.push({ name: "fetch_entity", status: "failed", detail: String(e) });
    return { entityId: opts.entityId, steps };
  }

  if (entity.type === "brand") {
    const websiteUrl = (entity as any).websiteUrl as string | undefined;
    if (!websiteUrl) {
      steps.push({ name: "ingest_brand_website", status: "failed", detail: "Brand missing websiteUrl" });
      return { entityId: opts.entityId, steps };
    }

    try {
      await opts.ingestion.ingestUrl({ brandId: entity.id, url: websiteUrl });
      steps.push({ name: "ingest_brand_website", status: "success" });
    } catch (e) {
      steps.push({ name: "ingest_brand_website", status: "failed", detail: String(e) });
      return { entityId: opts.entityId, steps };
    }
  } else {
    steps.push({ name: "ingest_brand_website", status: "skipped", detail: "Not a brand" });
  }

  try {
    const generated = await opts.content.generateCanonicalContent(entity);
    await opts.graph.putCanonicalContent(entity.id, generated.canonicalContent);
    steps.push({ name: "generate_and_persist_canonical_content", status: "success" });
  } catch (e) {
    steps.push({ name: "generate_and_persist_canonical_content", status: "failed", detail: String(e) });
    return { entityId: opts.entityId, steps };
  }

  try {
    await opts.rag.indexEntity(entity.id);
    steps.push({ name: "index_entity", status: "success" });
  } catch (e) {
    steps.push({ name: "index_entity", status: "failed", detail: String(e) });
    return { entityId: opts.entityId, steps };
  }

  // Optional policy init for brands: only create if absent
  if (entity.type === "brand") {
    try {
      const existing = await opts.graph.getBrandPolicyIfExists(entity.id);
      if (existing) {
        steps.push({ name: "ensure_brand_policy", status: "skipped", detail: "Policy already exists" });
      } else {
        const defaultPolicy = BrandPolicySchema.parse({
          allowedClaims: { canUseSuperlatives: false, allowedSuperlatives: [], allowedComparisons: [] },
          forbiddenPhrases: [],
          regulatedTopics: []
        });
        await opts.graph.putBrandPolicy(entity.id, defaultPolicy);
        steps.push({ name: "ensure_brand_policy", status: "success" });
      }
    } catch (e) {
      steps.push({ name: "ensure_brand_policy", status: "failed", detail: String(e) });
      return { entityId: opts.entityId, steps };
    }
  } else {
    steps.push({ name: "ensure_brand_policy", status: "skipped", detail: "Not a brand" });
  }

  return { entityId: opts.entityId, steps };
}
