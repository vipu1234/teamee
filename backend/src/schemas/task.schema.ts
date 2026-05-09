import { z } from 'zod';

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Task title is required'),
    description: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    dueDate: z.string().optional(),
    assigneeId: z.string().optional(),
    projectId: z.string().min(1, 'Project ID is required'),
    tags: z.array(z.string()).optional(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    dueDate: z.string().optional(),
    assigneeId: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});
