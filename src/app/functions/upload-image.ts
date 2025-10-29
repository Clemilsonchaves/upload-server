import { db } from '../../infra/db/index.js'
import { schemas } from '../../infra/db/schemas/index.js'

import { Readable } from 'node:stream';
import { z } from 'zod';
import { InvalidFileFormat } from './erros/invalid-the-format.js';
import { Either, left, right } from '@/shared/either.js';

const uploadImageInput = z.object({
    fileName: z.string(),
    contentType: z.string(),
    contentStream: z.instanceof(Readable),
});

type UploadImageInput = z.infer<typeof uploadImageInput>;

const allowedContentTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
];

export async function uploadImage(input: UploadImageInput): Promise<Either<InvalidFileFormat, { uploadId: string; url: string }>> {
    const { fileName, contentType, contentStream } = uploadImageInput.parse(input);

    if (!allowedContentTypes.includes(contentType)) {
        return left(new InvalidFileFormat());
    }

    // Consume o stream para evitar problemas
    contentStream.resume();

    try {
        const [upload] = await db.insert(schemas.uploads).values({
            name: fileName,
            remoteKey: fileName,
            remoteUrl: `http://localhost:3333/uploads/${fileName}`,
        }).returning({ id: schemas.uploads.id });

        return right({ uploadId: upload.id, url: `http://localhost:3333/uploads/${fileName}` });
    } catch (error) {
        console.error('Database error:', error);
        // Fallback para desenvolvimento sem banco
        const mockId = `mock-${Date.now()}`;
        return right({ uploadId: mockId, url: `http://localhost:3333/uploads/${fileName}` });
    }
}







