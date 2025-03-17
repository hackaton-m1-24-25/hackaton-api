import { createRoute, z } from "@hono/zod-openapi";
import { app } from "../../index.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { handleUserRoles, userResponseSchema } from "../../schema/userResponse.js";

const route = createRoute({
  method: 'get',
  path: 'api/auth/me',
  tags: ['Auth'],
  summary: 'Obtenir les infos du compte utilisateur connecté',
  middleware: [authMiddleware],
  responses: {
    200: {
      description: 'Retourne les infos du compte utilisateur',
      content: {
        'application/json': {
          schema: z.object({
            id: z.string().uuid(),
            email: z.string().email(),
            name: z.string()
          }),
        },
      },
    },
    401: {
      description: 'Token invalide ou manquant',
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
  
  return c.json("error", 400);
}

export const getMeRoute = () => app.openapi(route, handler)
