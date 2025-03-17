import { createRoute, z } from '@hono/zod-openapi'
import { app } from '../../index.js'
import { handleUserRoles } from '../../schema/userResponse.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';

const userResponseSchema = z.object({
    id: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    name: z.string().openapi({ example: "John Doe" }),
    email: z.string().email().openapi({ example: "john@example.com" }),
});

const route =
    createRoute({
        method: 'put',
        path: 'api/users/{id}',
        tags: ['Users'],
        summary: 'Mettre à jour un utilisateur',
        middleware: [authMiddleware],
        request: {
            params: z.object({
                id: z.string().uuid("L'ID doit être un UUID valide").openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
            }),
            body: {
                content: {
                    'application/json': {
                        schema: z.object({
                            name: z.string().min(1).optional().openapi({ example: "Jane Doe" }),
                            email: z.string().email().optional().openapi({ example: "jane@example.com" }),
                        }),
                    },
                },
                required: true,
            },
        },
        responses: {
            200: {
                description: 'Utilisateur mis à jour',
                content: {
                    'application/json': {
                        schema: userResponseSchema
                    },
                },
            },
            404: {
                description: 'Utilisateur non trouvé',
                content: {
                    'application/json': {
                        schema: z.object({
                            error: z.string(),
                        }),
                    },
                },
            },
        },
    });

const handler = async (c: any) => {
    const userId = c.get('userId');
    const { id } = c.req.valid('param');
    const { name, email } = c.req.valid('json');

    return c.json("data", 200);
}

export const updateUserRoute = () => {
    app.openapi(
        route,
        handler
    )
}