import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type TokenPayload } from '../utils/jwt.ts';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies?.['token'] || req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};
