import type { Request, Response, NextFunction } from 'express';
import { type ZodTypeAny } from 'zod';

export const validate = (schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction): void => {
  const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
  if (!result.success) {
    res.status(400).json({ success: false, error: result.error.errors[0]?.message || 'Validation failed', details: result.error.errors });
    return;
  }
  next();
};
