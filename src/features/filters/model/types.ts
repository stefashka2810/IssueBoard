export interface FiltersStore {
    search: string;
    state: "all" | "open" | "closed";
    selectedLabels: string[];

    setSearch: (value: string) => void;
    setState: (value: "all" | "open" | "closed") => void;
    toggleLabel: (label: string) => void;
    clearFilters: () => void;
}