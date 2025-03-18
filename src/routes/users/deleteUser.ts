import { createRoute, z } from "@hono/zod-openapi";
import { app } from "../../index.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const route = createRoute({
    method: 'delete',
    path: 'api/users/{id}',
    tags: ['Users'],
    summary: 'Supprimer un utilisateur',
    middleware: [authMiddleware],
    request: {
        params: z.object({
            id: z.string().uuid("L'ID doit être un UUID valide").openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
        }),
    },
    responses: {
        200: {
            description: 'Utilisateur supprimé avec succès',
            content: {
                'application/json': {
                    schema: z.object({ message: z.string() }),
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

   //TODO delete user
    return c.json({ message: "Utilisateur supprimé avec succès" }, 200);
}

export const deleteUserRoute = () => {
    app.openapi(
        route,
        handler
    )
}