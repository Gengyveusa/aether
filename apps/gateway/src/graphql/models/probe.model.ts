import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class AiVisibilityProbeResultGql {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  runAt!: string;

  @Field(() => String)
  modelId!: string;

  @Field(() => String)
  question!: string;

  @Field(() => Boolean)
  mentionsBrand!: boolean;

  @Field(() => String)
  descriptionSnippet!: string;

  @Field(() => String)
  sentiment!: string;
}
