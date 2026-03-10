import {z} from 'zod';

export const StatusSchema = z.enum(['todo', 'in_progress','done']);
export const IssueSchema = z.object({
    id: z.number(),
    number: z.number(),
    title: z.string(),
    labels: z.array(z.string()),
    status: StatusSchema,
    state: z.enum(['closed', 'open']),
    updatedAt: z.number().optional(),
})


export type Issue = z.infer<typeof IssueSchema>;
export type Status = z.infer<typeof StatusSchema>;