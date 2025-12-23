import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { GraphServiceClient } from "../clients/graphServiceClient.js";
import { BrandGql } from "./models/entity.model.js";
import { SourceDocumentGql } from "./models/sourceDocument.model.js";

@Resolver(() => BrandGql)
export class BrandFieldsResolver {
  constructor(private readonly graph: GraphServiceClient) {}

  @ResolveField(() => [SourceDocumentGql])
  async sourceDocuments(@Parent() brand: any): Promise<SourceDocumentGql[]> {
    const docs = await this.graph.listSourceDocuments(String(brand.id));
    return docs.map((d) => ({
      id: d.id,
      url: d.url,
      ingestedAt: d.ingestedAt,
      contentType: d.contentType
    }));
  }
}
