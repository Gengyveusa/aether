import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "node:path";

import { EntitiesModule } from "./entities.module.js";

const enableGraphql = process.env.DISABLE_GRAPHQL !== "true";

@Module({
  imports: [
    ...(enableGraphql
      ? [
          GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: join(process.cwd(), "apps/gateway/schema.gql"),
            sortSchema: true,
            playground: true,
            path: "/graphql"
          })
        ]
      : []),
    EntitiesModule
  ]
})
export class AppModule {}
