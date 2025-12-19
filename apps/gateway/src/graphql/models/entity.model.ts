import { Field, ID, InterfaceType, ObjectType, createUnionType } from "@nestjs/graphql";
import { SourceDocumentGql } from "./sourceDocument.model.js";

@InterfaceType()
export abstract class EntityBaseGql {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  type!: string;

  @Field(() => String)
  slug!: string;

  @Field(() => String)
  displayName!: string;

  @Field(() => String)
  description!: string;

  @Field(() => String)
  createdAt!: string;

  @Field(() => String)
  updatedAt!: string;
}

@ObjectType({ implements: () => EntityBaseGql })
export class BrandGql extends EntityBaseGql {
  @Field(() => String)
  websiteUrl!: string;

  @Field(() => [String])
  primaryTopics!: string[];

  @Field(() => [String])
  targetAudiences!: string[];

  @Field(() => [SourceDocumentGql])
  sourceDocuments!: SourceDocumentGql[];
}

@ObjectType({ implements: () => EntityBaseGql })
export class PersonGql extends EntityBaseGql {
  @Field(() => [String])
  roles!: string[];

  @Field(() => [String])
  affiliatedBrandIds!: string[];
}

@ObjectType({ implements: () => EntityBaseGql })
export class ProductGql extends EntityBaseGql {
  @Field(() => String)
  brandId!: string;

  @Field(() => [String])
  categories!: string[];
}

@ObjectType({ implements: () => EntityBaseGql })
export class StoryGql extends EntityBaseGql {
  @Field(() => String, { nullable: true })
  brandId?: string;

  @Field(() => [String], { nullable: true })
  personIds?: string[];

  @Field(() => [String])
  tags!: string[];
}

@ObjectType({ implements: () => EntityBaseGql })
export class ProofGql extends EntityBaseGql {
  @Field(() => String)
  sourceUrl!: string;

  @Field(() => String)
  sourceType!: string;

  @Field(() => String, { nullable: true })
  publishedAt?: string;

  @Field(() => String, { nullable: true })
  snippet?: string;
}

export const EntityUnion = createUnionType({
  name: "Entity",
  types: () => [BrandGql, PersonGql, ProductGql, StoryGql, ProofGql] as const,
  resolveType(value: any) {
    switch (value?.type) {
      case "brand":
        return BrandGql;
      case "person":
        return PersonGql;
      case "product":
        return ProductGql;
      case "story":
        return StoryGql;
      case "proof":
        return ProofGql;
      default:
        return undefined;
    }
  }
});
