import { db, pg } from '../../infra/db/index.js'
import { schemas } from '../../infra/db/schemas/index.js'
import { transform, z } from 'zod';
import { type Either, right } from '../../shared/either.js';
import { stringify } from 'csv-stringify'
import { ilike } from 'drizzle-orm';
import { pipeline } from 'node:stream/promises';
import { uploadFileToStorage } from '@/infra/storage/upload-file-to-storage.js';
import { PassThrough, Readable, Transform } from 'node:stream';
import { uploads } from '@/infra/db/schemas/uploads.js';


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

    // const csv = ''

    // for await (const rows of cursor) {
    //     console.log(rows);
    // }

    const csv = stringify({
        delimiter: ',',
        header: true,
        columns: [
            { key: 'id', header: 'ID' },
            { key: 'name', header: 'Name' },
            { key: 'remoteUrl', header: 'URL' },
            { key: 'createdAt', header: 'Uploaded At' },
        ],
    });

    const uploadToStorageStream = new PassThrough();

    const convertToCSVPipeline = pipeline(
        cursor,
        new Transform({
            objectMode: true,
            transform(chunk: unknown, encoding, callback) {
                this.push(chunk);
                callback();
            },
        }),
        csv,
        uploadToStorageStream
    );

    const uploadToStorage = uploadFileToStorage({
        contentType: 'text/csv',
        folder: 'downloads',
        fileName: `${new Date().toISOString()}-uploads.csv`,
        contentStream: uploadToStorageStream,
    });

    const [{ url }] = await Promise.all([uploadToStorage, convertToCSVPipeline]);



    return right({ reportUrl: url });
}


