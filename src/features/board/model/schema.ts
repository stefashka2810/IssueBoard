import {z} from "zod";

export const CreateIssueSchema = z.object({
    title: z.string().trim().min(1, "Заголовок не может быть пустым"),
    description: z.string(),
    labels: z.string(),
})
