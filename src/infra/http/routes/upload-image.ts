import { uploadImage } from "@/app/functions/upload-image.js";
import { isLeft, isRight } from "@/shared/either.js";
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
            response: {
                201: z.object({
                    uploadId: z.string(),
                    url: z.string()
                }).describe('Image uploaded successfully'),
                400: z
                    .object({ message: z.string() })
                    .describe('Bad request'),
                409: z
                    .object({ message: z.string() })
                    .describe('Upload already exists'),
                500: z
                    .object({ message: z.string() })
                    .describe('Internal server error'),
            }

        }
    },
        async (request, reply) => {
            const uploadFile = await (request as any).file({
                limits: {
                    fileSize: 1024 * 1024 * 2, // 2mb 
                },
            });

            if (!uploadFile) {
                return reply.status(400).send({ message: "file is required" });
            }

            if (uploadFile.truncated) {
                return reply.status(400).send({
                    message: 'File size limit reached.'
                });
            }


            const result = await uploadImage({
                fileName: uploadFile.filename,
                contentType: uploadFile.mimetype,
                contentStream: uploadFile.file,
            });

            if (isRight(result)) {
                const data = result.value;
                return reply.status(201).send({ uploadId: data.uploadId, url: data.url });
            }

            // Handle error cases
            const error = result.value;

            switch (error.constructor.name) {
                case 'InvalidFileFormat':
                    return reply.status(400).send({ message: error.message });
                default:
                    return reply.status(500).send({ message: 'Internal server error' });
            }

        }
    )
}






