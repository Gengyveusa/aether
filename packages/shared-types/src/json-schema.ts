import { zodToJsonSchema } from "zod-to-json-schema";
import {
  BrandSchema,
  CanonicalContentSchema,
  EntityBaseSchema,
  EntitySchema,
  PersonSchema,
  ProductSchema,
  ProofSchema,
  RelationshipSchema,
  StorySchema
} from "./domain.js";

export const entityBaseJsonSchema = zodToJsonSchema(EntityBaseSchema, { name: "EntityBase" });
export const brandJsonSchema = zodToJsonSchema(BrandSchema, { name: "Brand" });
export const personJsonSchema = zodToJsonSchema(PersonSchema, { name: "Person" });
export const productJsonSchema = zodToJsonSchema(ProductSchema, { name: "Product" });
export const storyJsonSchema = zodToJsonSchema(StorySchema, { name: "Story" });
export const proofJsonSchema = zodToJsonSchema(ProofSchema, { name: "Proof" });
export const entityJsonSchema = zodToJsonSchema(EntitySchema, { name: "Entity" });
export const relationshipJsonSchema = zodToJsonSchema(RelationshipSchema, { name: "Relationship" });
export const canonicalContentJsonSchema = zodToJsonSchema(CanonicalContentSchema, {
  name: "CanonicalContent"
});

export const allJsonSchemas = {
  EntityBase: entityBaseJsonSchema,
  Brand: brandJsonSchema,
  Person: personJsonSchema,
  Product: productJsonSchema,
  Story: storyJsonSchema,
  Proof: proofJsonSchema,
  Entity: entityJsonSchema,
  Relationship: relationshipJsonSchema,
  CanonicalContent: canonicalContentJsonSchema
} as const;
