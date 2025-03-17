import { JwtTokenExpired, JwtTokenInvalid } from 'hono/utils/jwt/types';
import jwt, { type JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

export const authMiddleware = async (c: any, next: any) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Accès refusé, token manquant ou mal formé' }, 401);
    }

    const token = authHeader.split(' ')[1];  // Extraire le token

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        c.set('userId', decoded.id);
        await next();
    } catch (error) {
        if (error instanceof JwtTokenExpired) {
            return c.json({ message: 'Token expiré' }, 401);
        }
        if (error instanceof JwtTokenInvalid) {
            return c.json({ message: 'Token invalide' }, 401);
        }

        return c.json({ message: 'Erreur lors de l\'authentification' }, 500);
    }
};
