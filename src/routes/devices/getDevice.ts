import { createRoute, z } from "@hono/zod-openapi";
import { app } from "../../index.js";
import iothub from "azure-iothub"
import { config } from 'dotenv';
config()

const route = createRoute({
    method: 'get',
    path: 'api/devices/{id}',
    tags: ['Devices'],
    summary: 'Récupère le state de la lampe',
    request: {
        params: z.object({
            id: z.string().openapi({ example: "lampe" }),
        }),
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
    const connectionString = process.env.connexion_string_iot || ""
    const registry = iothub.Registry.fromConnectionString(connectionString);
    try {
        const twin = await registry.getTwin(id);
        return c.json({ data: twin.responseBody }, 200);
    } catch (error) {
        return c.json({ message: "Erreur lors de la maj des devices" }, 400);

    }
}

export const getDeviceRoute = () => app.openapi(route, handler)