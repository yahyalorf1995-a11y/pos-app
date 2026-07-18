import { z } from 'zod';

export const goalInputSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  steps: z.string().optional(),
  source: z.string().optional(),
  isSuggested: z.boolean().optional(),
  parentGoalId: z.string().optional(),
  status: z.enum(['draft', 'active', 'paused', 'completed', 'archived', 'canceled']).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  category: z.enum(['health', 'career', 'relationships', 'learning', 'spirituality', 'personal']).optional(),
  progress: z.number().min(0).max(100).optional(),
  targetDate: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
  reminderTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  reminderEnabled: z.boolean().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  tags: z.array(z.string()).max(10).optional(),
});

export const goalUpdateSchema = goalInputSchema.partial();

export type GoalInput = z.infer<typeof goalInputSchema>;
export type GoalUpdateInput = z.infer<typeof goalUpdateSchema>;
