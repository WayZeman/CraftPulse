import { z } from "zod";

const HOST_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const IPV4_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;
const SLUG_REGEX = /^[a-z0-9-]+$/;

/** http(s) URL that survives `javascript:` / `data:` / etc. */
const httpUrl = z
  .string()
  .url()
  .refine((v) => /^https?:\/\//i.test(v), { message: "URL must start with http(s)://" });
const optionalHttpUrl = httpUrl.optional().or(z.literal(""));

export const hostSchema = z
  .string()
  .min(3)
  .max(253)
  .refine((v) => HOST_REGEX.test(v) || IPV4_REGEX.test(v), { message: "Invalid hostname" });

export const createServerSchema = z.object({
  name: z.string().min(3).max(64),
  slug: z.string().min(3).max(64).regex(SLUG_REGEX, "Slug may contain only lowercase letters, numbers and dashes"),
  shortDesc: z.string().min(10).max(280),
  description: z.string().min(20).max(5000),
  host: hostSchema,
  port: z.coerce.number().int().min(1).max(65535).default(25565),
  edition: z.enum(["JAVA", "BEDROCK", "CROSS_PLATFORM"]).default("JAVA"),
  website: optionalHttpUrl,
  discord: optionalHttpUrl,
  logo: optionalHttpUrl,
  banner: optionalHttpUrl,
  tags: z.array(z.string().regex(SLUG_REGEX).max(32)).min(1).max(8),
});

export type CreateServerInput = z.infer<typeof createServerSchema>;

export const updateServerSchema = createServerSchema.partial().extend({
  id: z.string().cuid(),
});

export const reviewSchema = z.object({
  serverId: z.string().cuid(),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().min(3).max(120).optional(),
  content: z.string().min(10).max(2000),
});

export const reportSchema = z.object({
  serverId: z.string().cuid().optional(),
  reason: z.enum([
    "SPAM",
    "INAPPROPRIATE",
    "HATE_SPEECH",
    "IMPERSONATION",
    "COPYRIGHT",
    "OFFLINE_FAKE",
    "CHEATING",
    "OTHER",
  ]),
  details: z.string().max(2000).optional(),
});

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/),
  name: z.string().min(2).max(64).optional(),
  bio: z.string().max(500).optional(),
  website: optionalHttpUrl,
  twitter: z.string().max(64).regex(/^[a-zA-Z0-9_@]*$/).optional().or(z.literal("")),
  youtube: z.string().max(64).regex(/^[a-zA-Z0-9_@\-]*$/).optional().or(z.literal("")),
});

export const searchServerSchema = z.object({
  q: z.string().max(64).optional(),
  tags: z.array(z.string()).optional(),
  version: z.string().optional(),
  edition: z.enum(["JAVA", "BEDROCK", "CROSS_PLATFORM"]).optional(),
  sort: z.enum(["votes", "online", "new", "trending", "rating"]).default("votes"),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(6).max(48).default(12),
});

export type SearchServerInput = z.infer<typeof searchServerSchema>;
