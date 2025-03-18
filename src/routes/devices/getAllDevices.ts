import { createRoute, z } from "@hono/zod-openapi";
import { app } from "../../index.js";
import { config } from 'dotenv';
import iothub from "azure-iothub"
config()

const route = createRoute({
    method: 'get',
    path: 'api/devices',
    tags: ['Devices'],
    summary: 'Récupère tout les devices',
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
    const connectionString = process.env.connexion_string_iot || ""
        const registry = iothub.Registry.fromConnectionString(connectionString);
    
        try {
            const result = await registry.list();
            return c.json({ data: result.responseBody }, 200);
        } catch (error) {
            console.error("Erreur lors de la récupération des devices:", error);
            return c.json({ message: "Erreur lors de la récupération des devices" }, 400);
        }
}

export const getAllDeviceRoute = () => app.openapi(route, handler)