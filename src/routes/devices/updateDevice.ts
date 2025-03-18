import { createRoute, z } from "@hono/zod-openapi";
import { app } from "../../index.js";
import iothub from "azure-iothub"
import { config } from 'dotenv';
config()

const route = createRoute({
    method: 'patch',
    path: 'api/devices/{id}',
    tags: ['Devices'],
    summary: 'Change le state de la lampe',
    request: {
        params: z.object({
            id: z.string().openapi({ example: "lampe" }),
        }),
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        led: z.boolean().openapi({ example: true }),
                    }),
                },
            },
            required: true,
        },
    },
    responses: {
        200: {
            description: 'State updated',
            content: {
                'application/json': {
                    schema: z.object({
                        message: z.string(),
                    }),
                },
            },
        },
        401: {
            description: 'Error while update state',
            content: {
                'application/json': {
                    schema: z.object({ error: z.string() }),
                },
            },
        },
    },
});

const handler = async (c: any) => {
    const { id } = c.req.valid('param');
    const { led } = c.req.valid('json');

    const connectionString = process.env.connexion_string_iot || ""
    const registry = iothub.Registry.fromConnectionString(connectionString);

    try {
        const twin = await registry.getTwin(id);
        const patch = {
            properties: {
                desired: {
                    led
                },
            },
        };

        const data = await registry.updateTwin(id, patch, twin.responseBody.etag);
        return c.json({ data: data.responseBody }, 200);
    } catch (error) {
        return c.json({ message: "Erreur lors de la maj des devices" }, 400);

    }
}

export const patchDeviceRoute = () => app.openapi(route, handler)