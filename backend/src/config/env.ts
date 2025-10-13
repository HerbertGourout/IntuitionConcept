import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.string().optional().default('4000'),
  FIREBASE_PROJECT_ID: z.string().min(1, 'FIREBASE_PROJECT_ID is required'),
  FIREBASE_CLIENT_EMAIL: z.string().email('FIREBASE_CLIENT_EMAIL must be a valid email'),
  FIREBASE_PRIVATE_KEY: z
    .string()
    .min(1, 'FIREBASE_PRIVATE_KEY is required')
    .transform((value: string) => value.replace(/\\n/g, '\n')),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  GROK_API_KEY: z.string().optional(),
  GOOGLE_VISION_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().email().optional(),
  SENDGRID_FROM_NAME: z.string().optional(),
  MAILGUN_API_KEY: z.string().optional(),
  MAILGUN_DOMAIN: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
  FLUTTERWAVE_SECRET_KEY: z.string().optional(),
  N8N_API_KEY: z.string().optional(),
  N8N_BASE_URL: z.string().url().optional()
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
