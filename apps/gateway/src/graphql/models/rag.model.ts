import { Field, Float, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class RagCitationGql {
  @Field(() => ID)
  id!: string;

  @Field(() => String, { nullable: true })
  url!: string | null;

  @Field(() => Float)
  score!: number;
}

@ObjectType()
export class RagAnswerGql {
  @Field(() => String)
  answer!: string;

  @Field(() => [RagCitationGql])
  citations!: RagCitationGql[];
}
