import { db } from '@/infra/db/index.js'
import { schemas } from '@/infra/db/schemas/index.js'

export async function makeUpload({ name }: { name?: string } = {}) {
    const fileName = name ?? `test-upload-${Date.now()}.jpg`

    // Most drivers return an array when using .returning(...)
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

    // If your DB/driver doesn't support .returning(), replace with a select by unique field
    // const [inserted] = await db.select().from(schemas.uploads).where(eq(schemas.uploads.name, fileName)).limit(1)

    return inserted // ensures caller can read uploaded.id
}