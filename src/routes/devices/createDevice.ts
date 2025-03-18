import { createRoute, z } from '@hono/zod-openapi'
import { app } from '../../index.js'
import crypto from "crypto"
import iothub from "azure-iothub"

const route =
    createRoute({
        method: 'post',
        description: 'Create a new device',
        path: 'api/devices',
        tags: ['Devices'],
        summary: 'Créer un nouveau device',
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: z.object({
                            name: z.string(),
                        }),
                    },
                },
                required: true,
            },
        },
        responses: {
            201: {
                description: 'Device créé',
                content: {
                    'application/json': {
                        schema: z.object({
                            id: z.string().uuid(),
                            name: z.string(),
                            email: z.string().email(),
                        }),
                    },
                },
            },
        },
    })

const handler = async (c: any) => {
    const { name } = c.req.valid('json');

    const connectionString = process.env.connexion_string_iot || ""
    const registry = iothub.Registry.fromConnectionString(connectionString);

    try {
        const device = await registry.create({ deviceId: name });        
        return c.json({ data: device.responseBody }, 200);
    } catch (error) {
        console.error("Erreur création device:", error);
        return c.json({ message: "Erreur création device" }, 400);
    }
}

export const createDeviceRoute = () => {
    app.openapi(
        route,
        handler
    )
}