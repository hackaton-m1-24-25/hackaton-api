import { createRoute, z } from "@hono/zod-openapi";
import { app } from "../../index.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { auth } from "../../firebase.js";
import { FirebaseAuthError } from "firebase-admin/auth";

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
  const userUid = c.get('userUid');
  try {
    const user = await auth.getUser(userUid)
    return c.json(user, 200);

  } catch (error) {
    if(error instanceof FirebaseAuthError) {
      const { message } = error
      return c.json({ message }, 400);
    }

    return c.json(error, 500);
  }
}

export const getMeRoute = () => app.openapi(route, handler)
