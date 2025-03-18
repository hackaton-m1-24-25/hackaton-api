import { createRoute, z } from "@hono/zod-openapi";
import { app } from "../../index.js";
import { userResponseSchema } from "../../schema/userResponse.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { auth } from "../../firebase.js";
import { FirebaseAuthError } from "firebase-admin/auth";

// Route GET /devices/{id}
const route = createRoute({
  method: "get",
  path: "api/devices/{id}",
  tags: ["Devices"],
  middleware: [authMiddleware],
  summary: "Récupérer un appareil par ID",
  request: {
    params: z.object({
      id: z.string().openapi({ example: "1" }),
    }),
  },
  responses: {
    200: {
      description: "Appareil trouvé",
      content: {
        "application/json": {
          schema: userResponseSchema,
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

export const getDeviceRoute = () => {
  app.openapi(route, handler);
};
