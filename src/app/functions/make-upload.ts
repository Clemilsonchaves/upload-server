import { db } from "@/infra/db/index.js"
import { schemas } from "@/infra/db/schemas/index.js"
import { fakerPT_BR as faker } from "@faker-js/faker"

export async function makeUpload({ name }: { name?: string } = {}) {
    const fileName = name ?? `test-upload-${Date.now()}.jpg`

    // most drivers return an array when using .returning(...)
    const [inserted] = await db.insert(schemas.uploads).values({
        name: fileName,
        remoteKey: fileName,
        remoteUrl: `http://localhost:3333/uploads/${fileName}`,
    }).returning({
        id: schemas.uploads.id,
        name: schemas.uploads.name,
        remoteKey: schemas.uploads.remoteKey,
        remoteUrl: schemas.uploads.remoteUrl,
        createdAt: schemas.uploads.createdAt,
    })

    return inserted // <- ensure we return the inserted record (contains id)
}