import { createRoute, z } from "@hono/zod-openapi";
import { app } from "../../index.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { firebase } from "../../firebase.js";

// Base de données Firebase
const db = getFirestore(firebase);
const DEVICES_COLLECTION = "devices";

// Schéma Zod pour les appareils
const DeviceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Le nom est requis"),
  type: z.string().min(1, "Le type est requis"),
  status: z.boolean(),
  brightness: z.number().min(0).max(100).optional(),
  color: z.string().optional(),
  temperature: z.number().optional(),
  location: z.string().min(1, "L'emplacement est requis"),
  lastUpdated: z.number(),
});

// Types basés sur le schéma
type Device = z.infer<typeof DeviceSchema>;
type DeviceInput = Omit<Device, "id" | "lastUpdated">;

// Middleware pour vérifier si l'ID existe
async function validateDeviceId(id: string): Promise<boolean> {
  const deviceRef = doc(db, DEVICES_COLLECTION, id);
  const deviceSnap = await getDoc(deviceRef);
  return deviceSnap.exists();
}

// Route CREATE - Ajouter un appareil
const createDeviceRoute = createRoute({
  method: "post",
  path: "/api/devices",
  tags: ["Devices"],
  summary: "Créer un nouvel appareil connecté",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: DeviceSchema.omit({ id: true, lastUpdated: true }).openapi({
            example: {
              name: "Lampe salon",
              type: "lamp",
              status: false,
              brightness: 75,
              color: "#FFFFFF",
              location: "Salon",
            },
          }),
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      description: "Appareil créé avec succès",
      content: {
        "application/json": {
          schema: DeviceSchema.extend({
            id: z.string(),
            message: z.string(),
          }).openapi({
            example: {
              id: "abcdef123456",
              name: "Lampe salon",
              type: "lamp",
              status: false,
              brightness: 75,
              color: "#FFFFFF",
              location: "Salon",
              lastUpdated: 1631600000000,
              message: "Appareil créé avec succès",
            },
          }),
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

const createDeviceHandler = async (c: any) => {
  try {
    const deviceData = c.req.valid("json") as DeviceInput;

    // Ajout du timestamp
    const newDevice = {
      ...deviceData,
      lastUpdated: Date.now(),
    };

    // Ajout à Firestore
    const docRef = await addDoc(collection(db, DEVICES_COLLECTION), newDevice);

    return c.json(
      {
        id: docRef.id,
        ...newDevice,
      },
      201
    );
  } catch (error: any) {
    console.error("Erreur lors de la création de l'appareil:", error);
    return c.json(
      { error: error.message || "Erreur lors de la création de l'appareil" },
      500
    );
  }
};

// Route READ - Récupérer tous les appareils
const getAllDevicesRoute = createRoute({
  method: "get",
  path: "/api/devices",
  tags: ["Devices"],
  summary: "Récupérer tous les appareils connectés",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Liste d'appareils récupérée avec succès",
      content: {
        "application/json": {
          schema: z.array(DeviceSchema).openapi({
            example: [
              {
                id: "abcdef123456",
                name: "Lampe salon",
                type: "lamp",
                status: false,
                brightness: 75,
                color: "#FFFFFF",
                location: "Salon",
                lastUpdated: 1631600000000,
              },
              {
                id: "ghijkl789012",
                name: "Thermostat salon",
                type: "thermostat",
                status: true,
                temperature: 22,
                location: "Salon",
                lastUpdated: 1631600000000,
              },
            ],
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

const getAllDevicesHandler = async (c: any) => {
  try {
    const querySnapshot = await getDocs(collection(db, DEVICES_COLLECTION));
    const devices: Device[] = [];

    querySnapshot.forEach((doc) => {
      devices.push({
        id: doc.id,
        ...(doc.data() as Omit<Device, "id">),
      });
    });

    return c.json(devices);
  } catch (error: any) {
    console.error("Erreur lors de la récupération des appareils:", error);
    return c.json(
      {
        error: error.message || "Erreur lors de la récupération des appareils",
      },
      500
    );
  }
};

// Route READ - Récupérer un appareil par ID
const getDeviceByIdRoute = createRoute({
  method: "get",
  path: "/api/devices/{id}",
  tags: ["Devices"],
  summary: "Récupérer un appareil par son ID",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ example: "abcdef123456" }),
    }),
  },
  responses: {
    200: {
      description: "Appareil récupéré avec succès",
      content: {
        "application/json": {
          schema: DeviceSchema.openapi({
            example: {
              id: "abcdef123456",
              name: "Lampe salon",
              type: "lamp",
              status: false,
              brightness: 75,
              color: "#FFFFFF",
              location: "Salon",
              lastUpdated: 1631600000000,
            },
          }),
        },
      },
    },
    404: {
      description: "Appareil non trouvé",
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

const getDeviceByIdHandler = async (c: any) => {
  try {
    const { id } = c.req.valid("param");
    const deviceRef = doc(db, DEVICES_COLLECTION, id);
    const deviceSnap = await getDoc(deviceRef);

    if (deviceSnap.exists()) {
      return c.json({
        id: deviceSnap.id,
        ...deviceSnap.data(),
      });
    } else {
      return c.json({ error: "Appareil non trouvé" }, 404);
    }
  } catch (error: any) {
    console.error("Erreur lors de la récupération de l'appareil:", error);
    return c.json(
      {
        error: error.message || "Erreur lors de la récupération de l'appareil",
      },
      500
    );
  }
};

// Route READ - Filtrer les appareils par type
const getDevicesByTypeRoute = createRoute({
  method: "get",
  path: "/api/devices/type/{type}",
  tags: ["Devices"],
  summary: "Récupérer les appareils par type",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      type: z.string().openapi({ example: "lamp" }),
    }),
  },
  responses: {
    200: {
      description: "Appareils récupérés avec succès",
      content: {
        "application/json": {
          schema: z.array(DeviceSchema).openapi({
            example: [
              {
                id: "abcdef123456",
                name: "Lampe salon",
                type: "lamp",
                status: false,
                brightness: 75,
                color: "#FFFFFF",
                location: "Salon",
                lastUpdated: 1631600000000,
              },
              {
                id: "ghijkl789012",
                name: "Lampe cuisine",
                type: "lamp",
                status: true,
                brightness: 100,
                color: "#FF0000",
                location: "Cuisine",
                lastUpdated: 1631600000000,
              },
            ],
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

const getDevicesByTypeHandler = async (c: any) => {
  try {
    const { type } = c.req.valid("param");
    const q = query(
      collection(db, DEVICES_COLLECTION),
      where("type", "==", type)
    );
    const querySnapshot = await getDocs(q);

    const devices: Device[] = [];
    querySnapshot.forEach((doc) => {
      devices.push({
        id: doc.id,
        ...(doc.data() as Omit<Device, "id">),
      });
    });

    return c.json(devices);
  } catch (error: any) {
    console.error(
      "Erreur lors de la récupération des appareils par type:",
      error
    );
    return c.json(
      {
        error:
          error.message ||
          "Erreur lors de la récupération des appareils par type",
      },
      500
    );
  }
};

// Route READ - Filtrer les appareils par pièce
const getDevicesByLocationRoute = createRoute({
  method: "get",
  path: "/api/devices/location/{location}",
  tags: ["Devices"],
  summary: "Récupérer les appareils par emplacement",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      location: z.string().openapi({ example: "Salon" }),
    }),
  },
  responses: {
    200: {
      description: "Appareils récupérés avec succès",
      content: {
        "application/json": {
          schema: z.array(DeviceSchema).openapi({
            example: [
              {
                id: "abcdef123456",
                name: "Lampe salon",
                type: "lamp",
                status: false,
                brightness: 75,
                color: "#FFFFFF",
                location: "Salon",
                lastUpdated: 1631600000000,
              },
              {
                id: "ghijkl789012",
                name: "Lampe cuisine",
                type: "lamp",
                status: true,
                brightness: 100,
                color: "#FF0000",
                location: "Cuisine",
                lastUpdated: 1631600000000,
              },
            ],
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

const getDevicesByLocationHandler = async (c: any) => {
  try {
    const { location } = c.req.valid("param");
    const q = query(
      collection(db, DEVICES_COLLECTION),
      where("location", "==", location)
    );
    const querySnapshot = await getDocs(q);

    const devices: Device[] = [];
    querySnapshot.forEach((doc) => {
      devices.push({
        id: doc.id,
        ...(doc.data() as Omit<Device, "id">),
      });
    });

    return c.json(devices);
  } catch (error: any) {
    console.error(
      "Erreur lors de la récupération des appareils par emplacement:",
      error
    );
    return c.json(
      {
        error:
          error.message ||
          "Erreur lors de la récupération des appareils par emplacement",
      },
      500
    );
  }
};

// Route UPDATE - Mettre à jour un appareil
const updateDeviceRoute = createRoute({
  method: "put",
  path: "/api/devices/{id}",
  tags: ["Devices"],
  summary: "Mettre à jour un appareil connecté",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ example: "abcdef123456" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: DeviceSchema.omit({ id: true, lastUpdated: true })
            .partial()
            .openapi({
              example: {
                name: "Lampe cuisine",
                brightness: 80,
                location: "Cuisine",
              },
            }),
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Appareil mis à jour avec succès",
      content: {
        "application/json": {
          schema: DeviceSchema.extend({
            message: z.string(),
          }).openapi({
            example: {
              id: "abcdef123456",
              name: "Lampe cuisine",
              type: "lamp",
              status: false,
              brightness: 80,
              color: "#FFFFFF",
              location: "Cuisine",
              lastUpdated: 1631600000000,
              message: "Appareil mis à jour avec succès",
            },
          }),
        },
      },
    },
    404: {
      description: "Appareil non trouvé",
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

const updateDeviceHandler = async (c: any) => {
  try {
    const { id } = c.req.valid("param");
    const updateData = c.req.valid("json");

    // Vérifier si l'appareil existe
    if (!(await validateDeviceId(id))) {
      return c.json({ error: "Appareil non trouvé" }, 404);
    }

    // Mettre à jour le timestamp
    const deviceData = {
      ...updateData,
      lastUpdated: Date.now(),
    };

    // Mettre à jour dans Firestore
    const deviceRef = doc(db, DEVICES_COLLECTION, id);
    await updateDoc(deviceRef, deviceData);

    // Récupérer les données mises à jour
    const updatedDeviceSnap = await getDoc(deviceRef);

    return c.json({
      id,
      ...updatedDeviceSnap.data(),
      message: "Appareil mis à jour avec succès",
    });
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour de l'appareil:", error);
    return c.json(
      { error: error.message || "Erreur lors de la mise à jour de l'appareil" },
      500
    );
  }
};

// Route DELETE - Supprimer un appareil
const deleteDeviceRoute = createRoute({
  method: "delete",
  path: "/api/devices/{id}",
  tags: ["Devices"],
  summary: "Supprimer un appareil connecté",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ example: "abcdef123456" }),
    }),
  },
  responses: {
    200: {
      description: "Appareil supprimé avec succès",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    404: {
      description: "Appareil non trouvé",
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

const deleteDeviceHandler = async (c: any) => {
  try {
    const { id } = c.req.valid("param");

    // Vérifier si l'appareil existe
    if (!(await validateDeviceId(id))) {
      return c.json({ error: "Appareil non trouvé" }, 404);
    }

    // Supprimer de Firestore
    const deviceRef = doc(db, DEVICES_COLLECTION, id);
    await deleteDoc(deviceRef);

    return c.json({ message: "Appareil supprimé avec succès" });
  } catch (error: any) {
    console.error("Erreur lors de la suppression de l'appareil:", error);
    return c.json(
      { error: error.message || "Erreur lors de la suppression de l'appareil" },
      500
    );
  }
};

// Exporter les routes
export const createDeviceRoutes = () => {
  app.openapi(createDeviceRoute, createDeviceHandler);
  app.openapi(getAllDevicesRoute, getAllDevicesHandler);
  app.openapi(getDeviceByIdRoute, getDeviceByIdHandler);
  app.openapi(getDevicesByTypeRoute, getDevicesByTypeHandler);
  app.openapi(getDevicesByLocationRoute, getDevicesByLocationHandler);
  app.openapi(updateDeviceRoute, updateDeviceHandler);
  app.openapi(deleteDeviceRoute, deleteDeviceHandler);
};
