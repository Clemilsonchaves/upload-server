import { beforeAll, describe, expect, it, vi } from 'vitest'
import { uploadImage } from './upload-image.js'
import { Readable } from 'node:stream'
import { isRight } from '@/shared/either.js'
import { randomUUID } from 'node:crypto'
import { db } from '@/infra/db/index.js'
import { schemas } from '@/infra/db/schemas/index.js'
import { eq } from 'drizzle-orm'

describe('uploadImage', () => {
    beforeAll(() => {
        vi.mock('@/infra/storage/upload-file-to-storage', () => {
            return {
                uploadFileToStorage: vi.fn().mockImplementation(async ({ fileName }) => {
                    return {
                        key: `${randomUUID()}.jpg`,
                        url: `http://storage.com/image.jpg`,
                    }
                })
            }
        })
    })
    it('should upload an image successfully', async () => {

        const fileName = `${randomUUID()}.jpg`

        const sut = await uploadImage({
            fileName,
            contentType: 'image/jpeg',
            contentStream: Readable.from([]),
        })
        // Test implementation goes here



        expect(isRight(sut)).toBe(true)

        const result = await db.select().from(schemas.uploads).where(eq(schemas.uploads.name, fileName)).limit(1)
        expect(result).toHaveLength(1)
    })
})