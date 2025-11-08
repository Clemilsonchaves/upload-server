import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";
import { env } from "../../env.js";
import { getUploadsRoute } from "./routes/get-uploads.js";
import { uploadImageRoute } from "./routes/upload-image.js";

console.log("Starting server...");
console.log("Environment:", env);

const server = fastify({
    logger: true
});

server.register(fastifyCors, {
    origin: "*"
});

server.get("/", async (request, reply) => {
    return { message: "Upload Server is running!", port: env.PORT };
});

server.get("/health", async (request, reply) => {
    return {
        status: "OK",
        timestamp: new Date().toISOString(),
        env: env.NODE_ENV
    };
});


server.register(uploadImageRoute);
server.register(getUploadsRoute);

const start = async () => {
    try {
        await server.listen({ port: env.PORT, host: "0.0.0.0" });
        console.log(`🚀 HTTP server running on http://localhost:${env.PORT}`);
        console.log(`📚 Health check: http://localhost:${env.PORT}/health`);
    } catch (err) {
        console.error("Error starting server:", err);
        process.exit(1);
    }
};

start();



