import { Controller, Get, NotFoundException, Param, Query } from "@nestjs/common";
import { EntitiesService } from "../services/entities.service.js";

@Controller()
export class EntitiesController {
  constructor(private readonly entities: EntitiesService) {}

  @Get("/entities/:id")
  async getEntity(@Param("id") id: string) {
    const entity = await this.entities.getEntityById(id);
    if (!entity) throw new NotFoundException("Entity not found");
    return entity;
  }

  @Get("/entities")
  async listEntities(
    @Query("type") _type?: string,
    @Query("slug") _slug?: string,
    @Query("search") _search?: string
  ) {
    // TODO: implement list/filters via graph-service endpoint
    return this.entities.listEntities();
  }
}
