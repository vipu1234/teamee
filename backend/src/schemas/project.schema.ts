import { z } from 'zod';

export const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    description: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    deadline: z.string().optional(),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    description: z.string().optional(),
    status: z.enum(['ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    deadline: z.string().optional(),
  }),
});
