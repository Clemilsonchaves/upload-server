import { db } from '../../infra/db/index.js'
import { schemas } from '../../infra/db/schemas/index.js'
import { z } from 'zod';
import { Either, right } from '@/shared/either.js';
import { asc, desc, ilike, count } from 'drizzle-orm';

const getUploadsInput = z.object({
    searchQuery: z.string().optional(),
    sortBy: z.enum(['createdAt']).optional(),
    sortDirection: z.enum(['asc', 'desc']).optional(),
    page: z.number().optional().default(1),
    pageSize: z.number().optional().default(20),
});

type GetUploadsInput = z.infer<typeof getUploadsInput>;

type GetUploadsOutput = {
    uploads: {
        id: string
        name: string
        remoteKey: string
        remoteUrl: string
        createdAt: Date
    }[]
    total: number

}



export async function getUploads(
    input: GetUploadsInput
): Promise<Either<never, { uploads: Array<{ uploadId: string; url: string; name: string; createdAt: Date }>, total: number }>> {
    const {
        searchQuery,
        sortBy,
        sortDirection,
        page,
        pageSize
    } = getUploadsInput.parse(input);

    const [uploads, totalResult] = await Promise.all([
        db
            .select({
                id: schemas.uploads.id,
                name: schemas.uploads.name,
                remoteUrl: schemas.uploads.remoteUrl,
                createdAt: schemas.uploads.createdAt
            })
            .from(schemas.uploads)
            .where(
                searchQuery ? ilike(schemas.uploads.name, `%${searchQuery}%`) : undefined
            )
            .orderBy(() => {
                if (sortBy === 'createdAt' && sortDirection === 'asc') {
                    return asc(schemas.uploads.createdAt);
                }
                return desc(schemas.uploads.createdAt);
            })
            .offset((page - 1) * pageSize)
            .limit(pageSize),

        db
            .select({ total: count() })
            .from(schemas.uploads)
            .where(
                searchQuery ? ilike(schemas.uploads.name, `%${searchQuery}%`) : undefined
            )
    ]);

    const total = totalResult[0]?.total || 0;

    return right({
        uploads: uploads.map(upload => ({
            uploadId: upload.id,
            url: upload.remoteUrl,
            name: upload.name,
            createdAt: upload.createdAt
        })),
        total
    });
}









