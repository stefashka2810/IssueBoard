import { z } from "zod";

export const GithubLabelSchema = z.object({
    id: z.number(),
    name: z.string(),
    color: z.string().optional(),
});

export const GithubIssueSchema = z.object({
    id: z.number(),
    number: z.number(),
    title: z.string(),
    state: z.enum(["open", "closed"]),
    labels: z.array(GithubLabelSchema),
    pull_request: z.unknown().optional(),
    updated_at: z.string(),
});

export type GithubIssue = z.infer<typeof GithubIssueSchema>;
export type GithubLabel = z.infer<typeof GithubLabelSchema>;
