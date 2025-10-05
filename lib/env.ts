import * as z from "zod";

export const envSchema = z.object({
  NEXT_PUBLIC_CONVEX_URL: z.string(),
  NEXT_PUBLIC_CONVEX_SITE_URL: z.string(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  NEXT_PUBLIC_CLERK_FRONTEND_API_URL: z.string(),
  NEXT_PUBLIC_APP_ENV: z.literal("test").optional(),
});

export type Env = z.infer<typeof envSchema>;

export const ENV = envSchema.parse({
  NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
  NEXT_PUBLIC_CONVEX_SITE_URL: process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  NEXT_PUBLIC_CLERK_FRONTEND_API_URL:
    process.env.NEXT_PUBLIC_CLERK_FRONTEND_API_URL,
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
});
