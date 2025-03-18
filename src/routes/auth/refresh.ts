import { createRoute, z } from "@hono/zod-openapi";
import { app } from "../../index.js";
import { getAuth, getIdToken } from "firebase/auth"
import { auth, firebase } from "../../firebase.js";

const route = createRoute({
    method: 'get',
    path: 'api/auth/refresh',
    tags: ['Auth'],
    summary: 'Refresh un token utilisateur',
    responses: {
        200: {
            description: 'Token refreshed',
            content: {
                'application/json': {
                    schema: z.object({
                        token: z.string(),
                    }),
                },
            },
        },
        401: {
            description: 'Refresh token invalide',
            content: {
                'application/json': {
                    schema: z.object({ error: z.string() }),
                },
            },
        },
    },
});

const handler = async (c: any) => {
    const authHeader = c.req.header('Authorization');    

    if (!authHeader) {
        return c.json({ error: 'Accès refusé, token manquant ou mal formé' }, 401);
    }

    const refreshToken = authHeader.split(' ')[1];  // Extraire le token

    const apiKey = process.env.apiKey;
    const url = `https://securetoken.googleapis.com/v1/token?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
            }),
        });

        const data = await response.json();
        console.log(data);
        
        
        if(data.error) {
            return c.json({ message: data.error.message }, data.error.code);
        }
        
        return c.json({ token: data.id_token}, 200);        
    } catch (error) {
        console.error("Erreur lors du rafraîchissement du token :", error);
        return c.json({ message: `Erreur lors du rafraîchissement du token : ${error}` }, 404);
    }
}

export const getRefreshTokenRoute = () => app.openapi(route, handler)