import { Injectable } from "@nestjs/common";
import {
  type CanonicalContent,
  CanonicalContentSchema,
  type Entity,
  EntitySchema
} from "@aether/shared-types";

function nowIso(): string {
  return new Date().toISOString();
}

@Injectable()
export class EntitiesService {
  private readonly entities = new Map<string, Entity>();
  private readonly canonical = new Map<string, CanonicalContent>();

  constructor() {
    // Seed data (stub)
    const brand = EntitySchema.parse({
      id: "brand_1",
      type: "brand",
      slug: "aether-ai",
      displayName: "Aether.ai",
      description: "AI visibility infrastructure.",
      websiteUrl: "https://example.com",
      primaryTopics: ["ai-visibility", "knowledge-graph"],
      targetAudiences: ["brands", "developers"],
      createdAt: nowIso(),
      updatedAt: nowIso()
    });

    const person = EntitySchema.parse({
      id: "person_1",
      type: "person",
      slug: "founder",
      displayName: "Founder",
      description: "Stub person.",
      roles: ["Founder"],
      affiliatedBrandIds: [brand.id],
      createdAt: nowIso(),
      updatedAt: nowIso()
    });

    this.entities.set(brand.id, brand);
    this.entities.set(person.id, person);

    this.canonical.set(
      brand.id,
      CanonicalContentSchema.parse({
        entityId: brand.id,
        aboutShort: "",
        aboutLong: "",
        faq: []
      })
    );
  }

  getEntityById(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  listEntities(opts?: { type?: string; slug?: string; search?: string }): Entity[] {
    const type = opts?.type?.trim();
    const slug = opts?.slug?.trim();
    const search = opts?.search?.trim().toLowerCase();

    return [...this.entities.values()].filter((e) => {
      if (type && e.type !== type) return false;
      if (slug && e.slug !== slug) return false;
      if (search) {
        const hay = `${e.displayName} ${e.slug} ${e.description}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });
  }

  getCanonicalContent(entityId: string): CanonicalContent | undefined {
    return this.canonical.get(entityId);
  }
}
