import {z} from "zod";

export const LabelSchema = z.object({
    name: z.string(),
})

export type Label = z.infer<typeof LabelSchema>;