import { randomUUID } from 'node:crypto';
import { basename, extname } from 'node:path';
import { Readable } from 'node:stream';
import { z } from 'zod';

const uploadFileToStorageInput = z.object({
    folder: z.enum(['images', 'downloads']),
    fileName: z.string(),
    contentType: z.string(),
    contentStream: z.instanceof(Readable),
});

type UploadFileToStorageInput = z.infer<typeof uploadFileToStorageInput>;

export async function uploadFileToStorage(input: UploadFileToStorageInput): Promise<{ key: string; url: string }> {
    const { folder, fileName, contentType, contentStream } =
        uploadFileToStorageInput.parse(input);

    const fileExtension = extname(fileName);
    const fileNameWithoutExtension = basename(fileName, fileExtension);
    const sanitizedFileName = fileNameWithoutExtension.replace(/[^a-zA-Z0-9-_]/g, '');
    const sanitizedFileNameWithExtension = sanitizedFileName + fileExtension;
    const uniqueFileName = `${folder}/${randomUUID()}-${sanitizedFileNameWithExtension}`;

    // Por enquanto, simulamos o upload sem storage externo
    console.log(`Simulating upload of ${uniqueFileName} with content type ${contentType}`);
    
    // Consume o stream para evitar problemas
    contentStream.resume();
    
    const mockUrl = `http://localhost:3333/uploads/${uniqueFileName}`;

    return {
        key: uniqueFileName,
        url: mockUrl,
    };
}