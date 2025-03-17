import { createRoute, z } from "@hono/zod-openapi";
import { app } from "../../index.js";
import { handleUserRoles, userResponseSchema } from "../../schema/userResponse.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

// Route GET /users/{id}
const route = createRoute({
    method: 'get',
    path: 'api/users/{id}',
    tags: ['Users'],
    summary: 'Récupérer un utilisateur par GUID',
    middleware: [authMiddleware],
    request: {
        params: z.object({
            id: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
        }),
    },
    responses: {
        200: {
            description: 'Utilisateur trouvé',
            content: {
                'application/json': {
                    schema: userResponseSchema,
                },
            },
        },
        404: {
            description: 'Utilisateur non trouvé',
            content: {
                'application/json': {
                    schema: z.object({
                        error: z.string().openapi({ example: "Utilisateur non trouvé" }),
                    }),
                },
            },
        },
    },
});

const handler = async (c: any) => {
    const { id } = c.req.valid('param');

    return c.json({ message: "Utilisateur supprimé avec succès" }, 200);

}

export const getUserRoute = () => {
    app.openapi(
        route,
        handler
    )
}