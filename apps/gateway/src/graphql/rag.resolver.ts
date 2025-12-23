import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { RagServiceClient } from "../clients/ragServiceClient.js";
import { RagAnswerGql } from "./models/rag.model.js";

@Resolver()
export class RagResolver {
  constructor(private readonly rag: RagServiceClient) {}

  @Query(() => RagAnswerGql)
  async answerForEntity(
    @Args("entityId") entityId: string,
    @Args("query") query: string,
    @Args("topK", { type: () => Int, nullable: true }) topK?: number
  ) {
    return await this.rag.answerForEntity({ entityId, query, topK });
  }

  @Mutation(() => Int)
  async indexEntity(@Args("entityId") entityId: string) {
    const res = await this.rag.indexEntity(entityId);
    return res.indexedCount;
  }
}
