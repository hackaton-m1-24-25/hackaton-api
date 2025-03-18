import { createRoute, z } from '@hono/zod-openapi'
import { app } from '../../index.js'
import iothub from "azure-iothub"

const route =
    createRoute({
        method: 'delete',
        description: 'Delete a device',
        path: 'api/devices',
        tags: ['Devices'],
        summary: 'Supprimer un device',
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
                description: 'Device supprimer',
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
        await registry.delete(name);
        return c.json({ message: `Device ${name} supprimé avec succès` }, 200);
    } catch (error) {
        console.error("Erreur suppression device:", error);
        return c.json({ message: "Erreur suppression device:" }, 400);
    }
        
}

export const deleteDeviceRoute = () => {
    app.openapi(
        route,
        handler
    )
}