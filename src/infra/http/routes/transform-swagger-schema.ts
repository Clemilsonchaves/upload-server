import { jsonSchemaTransform } from "fastify-type-provider-zod"

type TransformSwaggerSchemaData = Parameters<typeof jsonSchemaTransform>[0];

export function transformSwaggerSchema(data: TransformSwaggerSchemaData) {
    const { schema, url } = jsonSchemaTransform(data);
    const s = schema as any;

    if (s.consumes?.includes("multipart/form-data")) {
        if (s.body === undefined) {
            s.body = {
                type: "object",
                properties: {},
                required: []
            };
        }

        s.body.properties.file = {
            type: "string",
            format: "binary"
        };

        s.body.required.push("file");
    }

    return { schema, url };
}