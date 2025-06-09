import { z } from 'zod';

export const todoSchema = z.object({
    hospitalId: z.string(),
    creatorId: z.string(),
    assignedToId: z.string(),
    title: z.string(),
    description: z.string(),
    //status: z.enum(['Pending', 'InProgress', 'Completed']),
    status: z.string(),
    priority: z.optional(z.string()),
    keyId: z.optional(z.string()),
});

export const hospitalIdQuerySchema = z.object({
    hospitalId: z.string(),
});

export const updateTaskSchema = z.object({
    hospitalId: z.string(),
    id: z.string(),
});