import { db } from "@/infra/db/index.js";
import { schemas } from "@/infra/db/schemas/index.js";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";

export const uploadImageRoute: FastifyPluginAsyncZod = async server => {
    // Upload endpoint
    server.post("/uploads", {
        schema: {
            summary: "Upload an image",
            description: "Upload an image file to the server",
            tags: ["Upload"],
            consumes: ["multipart/form-data"],
            body: z.object({
                file: z.any().describe("Image file to upload"),
                name: z.string().optional().describe("Optional name for the file")
            }),
            response: {
                201: z.object({
                    uploadId: z.string(),
                    name: z.string(),
                    remoteUrl: z.string(),
                    message: z.string()
                }),
                400: z.object({ message: z.string() }).describe('Bad request'),
                500: z.object({ message: z.string() }).describe('Internal server error'),
            }
        },
        handler: async (request, reply) => {
            try {
                // Get the uploaded file
                const data = await request.file();

                if (!data) {
                    return reply.status(400).send({
                        message: "No file uploaded"
                    });
                }

                // Generate filename and remote key
                const fileName = data.filename || "unnamed-file";
                const remoteKey = `uploads/${Date.now()}-${fileName}`;
                const remoteUrl = `https://example.com/${remoteKey}`;

                // Save to database
                const [uploadRecord] = await db.insert(schemas.uploads).values({
                    name: fileName,
                    remoteKey,
                    remoteUrl
                }).returning();

                reply.status(201).send({
                    uploadId: uploadRecord.id,
                    name: uploadRecord.name,
                    remoteUrl: uploadRecord.remoteUrl,
                    message: "File uploaded successfully"
                });
            } catch (error) {
                console.error("Upload error:", error);
                reply.status(500).send({
                    message: "Failed to upload file"
                });
            }
        }
    });

    // List uploads endpoint
    server.get("/uploads", {
        schema: {
            summary: "List all uploads",
            description: "Get a list of all uploaded files",
            tags: ["Upload"],
            response: {
                200: z.object({
                    uploads: z.array(z.object({
                        id: z.string(),
                        name: z.string(),
                        remoteKey: z.string(),
                        remoteUrl: z.string(),
                        createdAt: z.string()
                    }))
                }),
                500: z.object({ message: z.string() })
            }
        },
        handler: async (request, reply) => {
            try {
                const uploads = await db.select().from(schemas.uploads);

                reply.status(200).send({
                    uploads: uploads.map(upload => ({
                        id: upload.id,
                        name: upload.name,
                        remoteKey: upload.remoteKey,
                        remoteUrl: upload.remoteUrl,
                        createdAt: upload.createdAt?.toISOString() || new Date().toISOString()
                    }))
                });
            } catch (error) {
                console.error("List uploads error:", error);
                reply.status(500).send({
                    message: "Failed to list uploads"
                });
            }
        }
    });
}