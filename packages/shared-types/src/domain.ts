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
  brandId: z.string().min(1).optional(),
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
