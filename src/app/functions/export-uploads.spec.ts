import { randomUUID } from 'node:crypto'
import { makeUpload } from '../../test/factories/make-upload.js'
import { describe, it, vi } from 'vitest'
import { exportUploads } from './export-uploads.js'
import * as upload from '../../infra/storage/upload-file-to-storage.js'
import { isRight, unwrapEither } from '../../shared/either.js'
import { expect } from 'vitest'

describe('export uploads', () => {
    it('should be able to  export uploads ', async () => {
        const uploadStub = vi
            .spyOn(upload, 'uploadFileToStorage')
            .mockImplementation(async () => {
                return {
                    key: `${randomUUID()}.csv`,
                    url: `http://example.com/file.csv`,
                }
            })

        const namePattern = randomUUID()

        const upload1 = await makeUpload({ name: `${namePattern}.webp` })
        const upload2 = await makeUpload({ name: `${namePattern}.webp` })
        const upload3 = await makeUpload({ name: `${namePattern}.webp` })
        const upload4 = await makeUpload({ name: `${namePattern}.webp` })
        const upload5 = await makeUpload({ name: `${namePattern}.webp` })

        const sut = await exportUploads({
            searchQuery: namePattern,
        })

        const generatedCSVStorage = uploadStub.mock.calls[0][0].contentStream
        const csvAsString = await new Promise<string>((resolve, reject) => {
            const chunks: Buffer[] = []

            generatedCSVStorage.on('data', (chunk: Buffer) => {
                chunks.push(chunk)
            })

            generatedCSVStorage.on('end', () => {
                resolve(Buffer.concat(chunks).toString('utf-8'))
            })

            generatedCSVStorage.on('error', (err: Error) => {
                reject(err)
            })

        })

        const csvAsArray = csvAsString
            .trim()
            .split('\n')
            .map(row => row.split(','))


        expect(isRight(sut)).toBe(true)
        expect(unwrapEither(sut)).toEqual({
            reportUrl: 'http://example.com/file.csv'
        })
        expect(csvAsArray).toEqual([
            ['ID', 'Name', 'URL', 'Uploaded At'],
            [upload1.id, upload1.name, upload1.remoteUrl, upload1.createdAt.toISOString()],
            [upload2.id, upload2.name, upload2.remoteUrl, upload2.createdAt.toISOString()],
            [upload3.id, upload3.name, upload3.remoteUrl, upload3.createdAt.toISOString()],
            [upload4.id, upload4.name, upload4.remoteUrl, upload4.createdAt.toISOString()],
            [upload5.id, upload5.name, upload5.remoteUrl, upload5.createdAt.toISOString()],
        ])
    })

})
