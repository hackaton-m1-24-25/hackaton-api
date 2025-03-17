import { createRoute, z } from "@hono/zod-openapi";
import { app } from "../../index.js";
import { userResponseSchema } from "../../schema/userResponse.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { auth } from "../../firebase.js";
import { FirebaseAuthError } from "firebase-admin/auth";

// Route GET /users/{id}
const route = createRoute({
    method: 'get',
    path: 'api/users/{uid}',
    tags: ['Users'],
    middleware: [authMiddleware],
    summary: 'Récupérer un utilisateur par UID',
    request: {
        params: z.object({
            uid: z.string().openapi({ example: "vhv4ooglMrX2g96x8l4nkkDmPjh2" }),
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
    const { uid } = c.req.valid('param');

    try {
        const user = await auth.getUser(uid)
        return c.json(user, 200);

    } catch (error) {
        if (error instanceof FirebaseAuthError) {
            const { message } = error
            return c.json({ message }, 400);
        }
        return c.json(error, 500);
    }
}


    export const getUserRoute = () => {
        app.openapi(
            route,
            handler
        )
    }