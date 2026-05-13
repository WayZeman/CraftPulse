import { z } from "zod";

const envSchema = z.object({
  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().optional(),

  // Auth
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET must be at least 16 chars"),
  AUTH_DISCORD_ID: z.string().optional(),
  AUTH_DISCORD_SECRET: z.string().optional(),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),

  // Redis
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Cron
  CRON_SECRET: z.string().optional(),

  // Discord webhook
  DISCORD_WEBHOOK_URL: z.string().url().optional(),

  ADMIN_BOOTSTRAP_EMAILS: z.string().optional(),
});

const result = envSchema.safeParse(process.env);

if (!result.success && process.env.NODE_ENV === "production") {
  console.error("❌ Invalid environment variables:", result.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = result.success ? result.data : ({} as z.infer<typeof envSchema>);
