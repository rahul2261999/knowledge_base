import { z } from 'zod';

export class CheerioValidation {
  public static CrawlWebsite = z.object({
    url: z.string({ message: 'url is required' }).url(),
    depth: z.optional(z.number({ message: 'depth is required' })),
  });
}
