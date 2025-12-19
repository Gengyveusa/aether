import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { EntitiesService } from "../services/entities.service.js";

@Controller()
export class CanonicalContentController {
  constructor(private readonly entities: EntitiesService) {}

  @Get("/canonical-content/:entityId")
  async getCanonical(@Param("entityId") entityId: string) {
    const content = await this.entities.getCanonicalContent(entityId);
    if (!content) throw new NotFoundException("CanonicalContent not found");
    return content;
  }
}
