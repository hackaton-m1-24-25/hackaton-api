import { createRoute, z } from "@hono/zod-openapi";
import { app } from "../../index.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { handleUserRoles, userResponseSchema } from "../../schema/userResponse.js";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key"; // 🔴 Change ce secret dans les variables d'env !

const route = createRoute({
    method: 'post',
    path: 'api/auth/login',
    tags: ['Auth'],
    summary: 'Authentifier un utilisateur',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        email: z.string().email().openapi({ example: "user@example.com" }),
                        password: z.string().openapi({ example: "StrongPass123!" }),
                    }),
                },
            },
            required: true,
        },
    },
    responses: {
        200: {
            description: 'Authentification réussie',
            content: {
                'application/json': {
                    schema: z.object({
                        token: z.string(),
                    }),
                },
            },
        },
        401: {
            description: 'Identifiants invalides',
            content: {
                'application/json': {
                    schema: z.object({ error: z.string() }),
                },
            },
        },
    },
});

const handler = async (c: any) => {
    const { email, password } = c.req.valid('json');

    const user = { password }

    // Vérifier si l'utilisateur existe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    // Générer le token JWT (expire en 24h)
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });

    return c.json({ token }, 200);
}

export const getLoginRoute = () => {
    app.openapi(
        route,
        handler
    )
}