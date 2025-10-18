import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";
import { env } from "../env.js";  // Added .js extension
import { hasZodFastifySchemaValidationErrors, jsonSchemaTransform, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { uploadImageRoute } from "./http/routes/upload-image.js";
import fastifyMultipart from "@fastify/multipart";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { transformSwaggerSchema } from "./http/routes/transform-swagger-schema.js";


const server = fastify();

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

server.setErrorHandler((error, request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
        return reply.status(400).send({
            message: "Validation error",
            issues: error.validation
        });
    }


    console.error(error);
    return reply.status(500).send({
        message: "Internal server error"
    });
});

server.register(fastifyCors, {
    origin: "*"
});

server.register(fastifyMultipart, {
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
})

server.register(fastifySwagger, {
    openapi: {
        info: {
            title: 'Upload Server API',
            description: 'API para upload de imagens',
            version: '1.0.0'
        },
        servers: [
            {
                url: `http://localhost:${env.PORT}`,
                description: 'Development server'
            }
        ]
    },
    transform: transformSwaggerSchema
})

server.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
        docExpansion: 'full',
        deepLinking: false
    },
    staticCSP: true,
    transformSpecificationClone: true
})

// Registar a rota de upload
server.register(uploadImageRoute)

server.listen({ port: env.PORT, host: "0.0.0.0" }).then(() => {
    console.log("HTTP server running!");
});



