import { Field, ObjectType } from "@nestjs/graphql";
import { GraphQLJSONObject } from "graphql-type-json";

@ObjectType()
export class BrandPolicyGql {
  @Field(() => GraphQLJSONObject)
  allowedClaims!: Record<string, unknown>;

  @Field(() => [String])
  forbiddenPhrases!: string[];

  @Field(() => [String])
  regulatedTopics!: string[];
}
