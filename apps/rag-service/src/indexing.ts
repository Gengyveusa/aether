import { z } from "zod";

export const EntityBundleSchema = z.object({
  entity: z.any(),
  canonicalContent: z.any().nullable(),
  sourceDocuments: z.array(
    z.object({
      id: z.string(),
      url: z.string().optional(),
      content: z.string().optional(),
      contentType: z.string().optional(),
      ingestedAt: z.string().optional()
    })
  )
});

export function stripHtml(html: string): string {
  // very basic: remove scripts/styles and tags
  const noScripts = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ");
  const noTags = noScripts.replace(/<[^>]+>/g, " ");
  return noTags.replace(/\s+/g, " ").trim();
}
