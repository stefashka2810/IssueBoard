import { create } from "zustand/react";
import { persist } from "zustand/middleware";
import type {SettingsStore} from "./types.ts";

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({
            repoFullName: "",
            token: "",

            setRepoFullName: (value) => set({ repoFullName: value }),
            setToken: (value) => set({ token: value }),
        }),
        {
            name: "settings-storage",
        }
    )
);
