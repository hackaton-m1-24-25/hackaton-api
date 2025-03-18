import { createRoute, z } from "@hono/zod-openapi";
import { app } from "../../index.js";

const DeviceSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis")
    .openapi({ example: "Lampe salon" }),
  type: z.string().min(1, "Le type est requis").openapi({ example: "lamp" }),
  status: z.boolean().openapi({ example: false }),
  brightness: z.number().int().min(0).max(100).openapi({ example: 75 }),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .openapi({ example: "#FFFFFF" }),
  location: z
    .string()
    .min(1, "La localisation est requise")
    .openapi({ example: "Salon" }),
});

// Route CREATE - Ajouter un appareil
const route = createRoute({
  method: "post",
  path: "/api/devices",
  tags: ["Devices"],
  summary: "Créer un nouvel appareil connecté",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: DeviceSchema,
        },
      },
      required: true,
      description: "Données de l'appareil à créer",
    },
  },
  responses: {
    201: {
      description: "Appareil créé avec succès",
      content: {
        "application/json": {
          schema: DeviceSchema,
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
  const { name, type, status, brightness, color, location } =
    c.req.valid("json");

  return c.json({ error: "Erreur lors de la création de l'appareil" }, 500);
};

export const createDeviceRoute = () => {
  app.openapi(route, handler);
};
