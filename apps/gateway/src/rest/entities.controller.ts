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
    @Query("type") type?: string,
    @Query("slug") _slug?: string,
    @Query("search") search?: string,
    @Query("brandId") brandId?: string
  ) {
    // TODO: implement list/filters via graph-service endpoint
    return this.entities.listEntities({ type, search, brandId });
  }
}
