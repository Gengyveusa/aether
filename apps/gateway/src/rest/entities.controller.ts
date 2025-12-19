import { Controller, Get, NotFoundException, Param, Query } from "@nestjs/common";
import { EntitiesService } from "../services/entities.service.js";

@Controller()
export class EntitiesController {
  constructor(private readonly entities: EntitiesService) {}

  @Get("/entities/:id")
  getEntity(@Param("id") id: string) {
    const entity = this.entities.getEntityById(id);
    if (!entity) throw new NotFoundException("Entity not found");
    return entity;
  }

  @Get("/entities")
  listEntities(
    @Query("type") type?: string,
    @Query("slug") slug?: string,
    @Query("search") search?: string
  ) {
    return this.entities.listEntities({ type, slug, search });
  }
}
