import { createRoute, z } from "@hono/zod-openapi";
import { app } from "../../index.js";
import { userResponseSchema } from "../../schema/userResponse.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { auth } from "../../firebase.js";
import { FirebaseAuthError } from "firebase-admin/auth";

// Route PUT /devices/{id}
const route = createRoute({
  method: "put",
  path: "api/devices/{id}",
  tags: ["Devices"],
  middleware: [authMiddleware],
  summary: "Mettre à jour un appareil par ID",
  request: {
    params: z.object({
      id: z.string().openapi({ example: "1" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: userResponseSchema,
        },
      },
      required: true,
      description: "Données de l'appareil à mettre à jour",
    },
  },
  responses: {
    200: {
      description: "Appareil mis à jour avec succès",
      content: {
        "application/json": {
          schema: userResponseSchema,
        },
      },
    },
    400: {
      description: "Données invalides",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
        },
      },
    },
    404: {
      description: "Appareil non trouvé",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string().openapi({ example: "Appareil non trouvé" }),
          }),
        },
      },
    },
    500: {
      description: "Erreur serveur",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
});

const handler = async (c: any) => {
  const { id } = c.req.valid("param");

  try {
    const user = await auth.getUser(id);
    return c.json(user, 200);
  } catch (error) {
    if (error instanceof FirebaseAuthError) {
      const { message } = error;
      return c.json({ message }, 400);
    }
    return c.json(error, 500);
  }
};

export const updateDeviceRoute = () => {
  app.openapi(route, handler);
};
