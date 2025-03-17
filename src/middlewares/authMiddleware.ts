import { JwtTokenExpired, JwtTokenInvalid } from 'hono/utils/jwt/types';
import { auth } from '../firebase.js';
import { FirebaseAuthError } from 'firebase-admin/auth';

export const authMiddleware = async (c: any, next: any) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Accès refusé, token manquant ou mal formé' }, 401);
    }

    const token = authHeader.split(' ')[1];  // Extraire le token

    try {        
        const decodedToken = await auth.verifyIdToken(token)
        c.set('userUid', decodedToken.uid);
        await next();
    } catch (error) {
        if (error instanceof JwtTokenExpired) {
            return c.json({ message: 'Token expiré' }, 401);
        }
        if (error instanceof JwtTokenInvalid) {
            return c.json({ message: 'Token invalide' }, 401);
        }

        if(error instanceof FirebaseAuthError) {
            console.log(error);
            
            return c.json({ message: error.message }, 401);
        }

        console.log(error);
        return c.json({ message: 'Erreur lors de l\'authentification' }, 500);
    }
};
