import {z} from "zod";

export const SettingSchema = z.object({
    repoFullName: z.string().trim().min(1, 'Полное название репозитория не может быть пустым').regex(/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/, "Полное название репозитория должно быть в формате 'owner/repo'"),
    token: z.string().trim().min(1, "Токен не может быть пустым"),
})

export type Setting = z.infer<typeof SettingSchema>;