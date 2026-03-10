import { create } from "zustand/react";
import type {FiltersStore} from "./types.ts";

export const useFiltersStore = create<FiltersStore>((set) => ({
    search: "",
    state: "all",
    selectedLabels: [],

    setSearch: (value) => set({ search: value }),
    setState: (value) => set({ state: value }),
    toggleLabel: (label) =>
        set((s) => ({
            selectedLabels: s.selectedLabels.includes(label)
                ? s.selectedLabels.filter((l) => l !== label)
                : [...s.selectedLabels, label],
        })),
    clearFilters: () => set({ search: "", state: "all", selectedLabels: [] }),
}));
