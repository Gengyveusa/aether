import { z } from "zod";

export const EntityTypeSchema = z.enum(["brand", "person", "product", "story", "proof"]);
export type EntityType = z.infer<typeof EntityTypeSchema>;

export const EntityBaseSchema = z.object({
  id: z.string().min(1),
  type: EntityTypeSchema,
  slug: z.string().min(1),
  displayName: z.string().min(1),
  description: z.string().default(""),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});
export type EntityBase = z.infer<typeof EntityBaseSchema>;

export const BrandSchema = EntityBaseSchema.extend({
  type: z.literal("brand"),
  websiteUrl: z.string().url(),
  primaryTopics: z.array(z.string()).default([]),
  targetAudiences: z.array(z.string()).default([])
});
export type Brand = z.infer<typeof BrandSchema>;

export const PersonSchema = EntityBaseSchema.extend({
  type: z.literal("person"),
  roles: z.array(z.string()).default([]),
  affiliatedBrandIds: z.array(z.string()).default([])
});
export type Person = z.infer<typeof PersonSchema>;

export const ProductSchema = EntityBaseSchema.extend({
  type: z.literal("product"),
  brandId: z.string().min(1),
  categories: z.array(z.string()).default([])
});
export type Product = z.infer<typeof ProductSchema>;

export const StorySchema = EntityBaseSchema.extend({
  type: z.literal("story"),
  brandIds: z.array(z.string()).optional(),
  personIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).default([])
});
export type Story = z.infer<typeof StorySchema>;

export const ProofSourceTypeSchema = z.enum(["owned", "earned", "third_party"]);
export type ProofSourceType = z.infer<typeof ProofSourceTypeSchema>;

export const ProofSchema = EntityBaseSchema.extend({
  type: z.literal("proof"),
  sourceUrl: z.string().url(),
  sourceType: ProofSourceTypeSchema,
  publishedAt: z.string().datetime().optional(),
  snippet: z.string().optional()
});
export type Proof = z.infer<typeof ProofSchema>;

export const EntitySchema = z.discriminatedUnion("type", [
  BrandSchema,
  PersonSchema,
  ProductSchema,
  StorySchema,
  ProofSchema
]);
export type Entity = z.infer<typeof EntitySchema>;

export type AnyEntity = Brand | Person | Product | Story | Proof;

export function isBrandEntity(e: Entity): e is Brand {
  return e.type === "brand";
}
export function isPersonEntity(e: Entity): e is Person {
  return e.type === "person";
}
export function isProductEntity(e: Entity): e is Product {
  return e.type === "product";
}
export function isStoryEntity(e: Entity): e is Story {
  return e.type === "story";
}
export function isProofEntity(e: Entity): e is Proof {
  return e.type === "proof";
}

export const RelationshipTypeSchema = z.enum([
  "founded_by",
  "endorses",
  "competes_with",
  "powered_by",
  "appears_in",
  "referenced_by"
]);
export type RelationshipType = z.infer<typeof RelationshipTypeSchema>;

export const RelationshipSchema = z.object({
  id: z.string().min(1),
  fromEntityId: z.string().min(1),
  toEntityId: z.string().min(1),
  type: RelationshipTypeSchema,
  proofIds: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});
export type Relationship = z.infer<typeof RelationshipSchema>;

export const CanonicalFaqItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  proofIds: z.array(z.string()).optional()
});
export type CanonicalFaqItem = z.infer<typeof CanonicalFaqItemSchema>;

export const CanonicalComparisonSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  competitorIds: z.array(z.string()).default([])
});
export type CanonicalComparison = z.infer<typeof CanonicalComparisonSchema>;

export const CanonicalContentSchema = z.object({
  entityId: z.string().min(1),
  aboutShort: z.string().default(""),
  aboutLong: z.string().default(""),
  faq: z.array(CanonicalFaqItemSchema).default([]),
  comparisons: z.array(CanonicalComparisonSchema).optional()
});
export type CanonicalContent = z.infer<typeof CanonicalContentSchema>;

export const SourceDocumentSchema = z.object({
  id: z.string().min(1),
  brandId: z.string().min(1),
  url: z.string().url(),
  content: z.string().optional(),
  contentType: z.string().optional(),
  ingestedAt: z.string().datetime()
});
export type SourceDocument = z.infer<typeof SourceDocumentSchema>;

export const AllowedClaimsSchema = z
  .object({
    canUseSuperlatives: z.boolean().default(false),
    allowedSuperlatives: z.array(z.string()).default([]),
    allowedComparisons: z.array(z.string()).default([])
  })
  .default({
    canUseSuperlatives: false,
    allowedSuperlatives: [],
    allowedComparisons: []
  });
export type AllowedClaims = z.infer<typeof AllowedClaimsSchema>;

export const BrandPolicySchema = z.object({
  allowedClaims: AllowedClaimsSchema,
  forbiddenPhrases: z.array(z.string()).default([]),
  regulatedTopics: z.array(z.string()).default([])
});
export type BrandPolicy = z.infer<typeof BrandPolicySchema>;

export const AiVisibilityProbeConfigSchema = z.object({
  id: z.string().min(1),
  brandId: z.string().min(1),
  questions: z.array(z.string()).min(1),
  targetModels: z.array(z.string()).min(1)
});
export type AiVisibilityProbeConfig = z.infer<typeof AiVisibilityProbeConfigSchema>;

export const SentimentSchema = z.enum(["positive", "neutral", "negative"]);
export type Sentiment = z.infer<typeof SentimentSchema>;

export const AiVisibilityProbeResultSchema = z.object({
  id: z.string().min(1),
  probeConfigId: z.string().min(1),
  brandId: z.string().min(1),
  runAt: z.string().datetime(),
  modelId: z.string().min(1),
  question: z.string().min(1),
  rawAnswer: z.string().min(1),
  mentionsBrand: z.boolean(),
  descriptionSnippet: z.string().min(1),
  sentiment: SentimentSchema
});
export type AiVisibilityProbeResult = z.infer<typeof AiVisibilityProbeResultSchema>;

export const AiVisibilityScorecardSchema = z.object({
  entityId: z.string().min(1),
  computedAt: z.string().datetime(),
  coverage: z.number().min(0).max(1),
  sentimentScore: z.number().min(-1).max(1),
  descriptionConsistency: z.number().min(0).max(1)
});
export type AiVisibilityScorecard = z.infer<typeof AiVisibilityScorecardSchema>;
