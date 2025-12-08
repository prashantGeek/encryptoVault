import {Request, Response, NextFunction} from 'express';
import JWT from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

interface JwtPayload {
    userId: number;
    email: string;
}

export interface AuthRequest extends Request {  
    user?: JwtPayload;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        res.status(401).json({ message: 'Authorization header missing' });
        return;
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
        res.status(401).json({ message: 'Invalid token format' });
        return;
    }

    const [schema, token] = parts as [string, string];

    if (schema !== 'Bearer') {
        res.status(401).json({ message: 'Invalid token schema' });
        return;
    }

    try {
        const decoded = JWT.verify(token, JWT_SECRET) as unknown as JwtPayload;
        req.user = { userId: decoded.userId, email: decoded.email };
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
        return;
    }
}