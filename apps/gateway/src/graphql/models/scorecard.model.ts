import { Field, Float, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class AiVisibilityScorecardGql {
  @Field(() => ID)
  entityId!: string;

  @Field(() => String)
  computedAt!: string;

  @Field(() => Float)
  coverage!: number;

  @Field(() => Float)
  sentimentScore!: number;

  @Field(() => Float)
  descriptionConsistency!: number;
}

@ObjectType()
export class OnboardingStepGql {
  @Field(() => String)
  name!: string;

  @Field(() => String)
  status!: string;

  @Field(() => String, { nullable: true })
  detail?: string;
}

@ObjectType()
export class OnboardingResultGql {
  @Field(() => ID)
  entityId!: string;

  @Field(() => [OnboardingStepGql])
  steps!: OnboardingStepGql[];
}

@ObjectType()
export class RunProbesAndScoreResultGql {
  @Field(() => [String])
  probeResultIds!: string[];

  @Field(() => AiVisibilityScorecardGql)
  scorecard!: AiVisibilityScorecardGql;
}
