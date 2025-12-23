import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class SourceDocumentGql {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  url!: string;

  @Field(() => String)
  ingestedAt!: string;

  @Field(() => String, { nullable: true })
  contentType?: string;
}
