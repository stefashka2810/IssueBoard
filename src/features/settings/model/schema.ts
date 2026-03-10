import {z} from "zod";

export const SettingSchema = z.object({
    repoFullName: z.string().trim().min(1, 'Repo full name cannot be empty').regex(/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/, "Repo full name must be in the format 'owner/repo'"),
    token: z.string().trim().min(1, "Token cannot be empty"),
})

export type Setting = z.infer<typeof SettingSchema>;