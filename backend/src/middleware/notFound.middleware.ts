import { Request, Response, NextFunction } from 'express';
import { CustomError } from './error.middleware';

export function notFound(req: Request, res: Response, next: NextFunction) {
  const error = new CustomError(`Not found - ${req.originalUrl}`, 404);
  next(error);
}