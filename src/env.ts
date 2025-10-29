export const env = {
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://docker:docker@localhost:5432/upload',
    PORT: process.env.PORT ? Number(process.env.PORT) : 3333,
    NODE_ENV: process.env.NODE_ENV || 'development',
} as const;