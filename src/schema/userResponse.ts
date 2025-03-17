import { z } from "@hono/zod-openapi";

// Schéma pour la réponse utilisateur
export const userResponseSchema = z.object({
    id: z.string().uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
    name: z.string().openapi({ example: "John Doe" }),
    email: z.string().email().openapi({ example: "john@example.com" }),
    roles: z.string().array().openapi({ example: ["user"] }),
});

export const handleUserRoles = (user: any) => {
    return {
        ...user,
        roles: user.roles.map((role: { name: string; }) => role.name)
    }
  }