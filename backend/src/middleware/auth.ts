import type { Request, Response, NextFunction } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';

import { firebaseAuth } from '../config/firebase';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  token?: string;
  claims?: DecodedIdToken;
  headers: Request['headers'] & {
    authorization?: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authorization header missing or malformed' });
    return;
  }

  const idToken = authorization.replace('Bearer ', '').trim();

  try {
    const decoded = await firebaseAuth.verifyIdToken(idToken, true);
    req.userId = decoded.uid;
    req.token = idToken;
    req.claims = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token', details: (error as Error).message });
  }
};
