import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class CanonicalFaqItemGql {
  @Field(() => String)
  question!: string;

  @Field(() => String)
  answer!: string;

  @Field(() => [String], { nullable: true })
  proofIds?: string[];
}

@ObjectType()
export class CanonicalComparisonGql {
  @Field(() => String)
  title!: string;

  @Field(() => String)
  body!: string;

  @Field(() => [String])
  competitorIds!: string[];
}

@ObjectType()
export class CanonicalContentGql {
  @Field(() => String)
  entityId!: string;

  @Field(() => String)
  aboutShort!: string;

  @Field(() => String)
  aboutLong!: string;

  @Field(() => [CanonicalFaqItemGql])
  faq!: CanonicalFaqItemGql[];

  @Field(() => [CanonicalComparisonGql], { nullable: true })
  comparisons?: CanonicalComparisonGql[];
}
