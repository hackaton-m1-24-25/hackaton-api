import { createRoute, z } from '@hono/zod-openapi'
import { app } from '../../index.js'
import bcrypt from 'bcrypt';

const userSchema = z.object({
    name: z.string().min(1, "Le nom est requis").openapi({ example: "John Doe" }),
    email: z.string().email("Email invalide").openapi({ example: "john@example.com" }),
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").openapi({ example: "StrongPass123!" }),
});

const route =
    createRoute({
        method: 'post',
        description: 'Create a new user',
        path: 'api/users',
        tags: ['Users'],        
        summary: 'Créer un nouvel utilisateur',
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: userSchema,
                    },
                },
                required: true,
            },
        },
        responses: {
            201: {
                description: 'Utilisateur créé',
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
    const { name, email, password } = c.req.valid('json');
 
    return c.json({ error: "Erreur lors de la création de l'utilisateur" }, 500);
  
}

export const createUserRoute = () => {
    app.openapi(
        route,
        handler
    )
}