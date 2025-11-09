import { db, pg } from '../../infra/db/index.js'
import { schemas } from '../../infra/db/schemas/index.js'
import { z } from 'zod';
import { type Either, right } from '../../shared/either.js';
import { ilike } from 'drizzle-orm';
import { SQLJsSession } from 'drizzle-orm/sql-js';

const exportUploadsInput = z.object({
    searchQuery: z.string().optional(),

});

type ExportUploadsInput = z.input<typeof exportUploadsInput>;

type ExportUploadsOutput = {
    reportUrl: string;
}

export async function exportUploads(
    input: ExportUploadsInput
): Promise<Either<never, ExportUploadsOutput>> {
    const {
        searchQuery,
    } = exportUploadsInput.parse(input);

    const { sql, params } = db
        .select({

            id: schemas.uploads.id,
            name: schemas.uploads.name,
            remoteUrl: schemas.uploads.remoteUrl
        })
        .from(schemas.uploads)
        .where(
            searchQuery ? ilike(schemas.uploads.name, `%${searchQuery}%`) : undefined
        ).toSQL();

    const cursor = pg.unsafe(sql, params as string[]).cursor(1);

    const csv = ''

    for await (const rows of cursor) {
        console.log(rows);
    }
    return right({ reportUrl: '' });
}


