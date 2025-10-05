import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';

// Assuming you have an authentication middleware that sets req.user based on JWT or similar
// req.user should contain { id: number, role: Role, ... }

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: Role;
  };
}

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log(req.user)
  if (!req.user || req.user === undefined) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  console.log(req.user)
  if (req.user.role !== Role.ADMIN) {
    return res.status(403).json({ error: 'Access denied: Admin only' });
  }
  next();
};