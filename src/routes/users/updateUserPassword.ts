import { createRoute, z } from '@hono/zod-openapi'
import { app } from '../../index.js'
import bcrypt from 'bcrypt';
import { handleUserRoles } from '../../schema/userResponse.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';

const route =
    createRoute({
        method: 'patch',
        path: 'api/users/{id}/password',
        tags: ['Users'],
        summary: 'Modifier le mot de passe d’un utilisateur',
        middleware: [authMiddleware],
        request: {
            params: z.object({
                id: z.string().uuid("L'ID doit être un UUID valide").openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
            }),
            body: {
                content: {
                    'application/json': {
                        schema: z.object({
                            oldPassword: z.string().min(6).openapi({ example: "OldPass123!" }),
                            newPassword: z.string().min(6).openapi({ example: "NewSecurePass456!" }),
                        }),
                    },
                },
                required: true,
            },
        },
        responses: {
            200: {
                description: 'Mot de passe mis à jour avec succès',
                content: {
                    'application/json': {
                        schema: z.object({ message: z.string() }),
                    },
                },
            },
            400: {
                description: 'Mot de passe incorrect',
                content: {
                    'application/json': {
                        schema: z.object({ error: z.string() }),
                    },
                },
            },
            404: {
                description: 'Utilisateur non trouvé',
                content: {
                    'application/json': {
                        schema: z.object({ error: z.string() }),
                    },
                },
            },
        },
    });

const handler = async (c: any) => {
    const userId = c.get('userId');
    const { id } = c.req.valid('param');
    const { oldPassword, newPassword } = c.req.valid('json');

    return c.json({ message: "Mot de passe mis à jour avec succès" }, 200);
}

export const updateUserPassword = () => {
    app.openapi(
        route,
        handler
    )
}