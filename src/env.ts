import { z } from 'zod';

const envSchema = z.object({
    PORT: z.coerce.number().default(3333),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    DATABASE_URL: z.string().startsWith('postgresql://'),
});

export const env = {
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/defaultdb',
    PORT: process.env.PORT ? Number(process.env.PORT) : 3333,
} as const;