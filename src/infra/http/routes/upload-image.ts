import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";


export const uploadImageRoute: FastifyPluginAsyncZod = async server => {
    server.post("/uploads", {
        schema: {
            summary: "Upload an image",
            body: z.object({
                name: z.string(),
                password: z.string().optional()
            }),

            response: {
                201: z.object({ url: z.string() }),
                400: z.object({ message: z.string() }).describe('Upload already exists'),
            }

        },
        handler: async (_request, reply) => {
            reply.status(201).send({ url: "https://example.com/image.png" });
        }
    });

} 