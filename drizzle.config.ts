import type { Config } from 'drizzle-kit';

export default {
    dbCredentials: {
        url: process.env.DATABASE_URL || 'postgresql://localhost:5432/defaultdb',
    },

    dialect: 'postgresql',
    schema: 'src/infra/db/schemas/*',
    out: 'src/infra/db/migrations',
} satisfies Config;