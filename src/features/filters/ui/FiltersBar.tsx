import { Search, X, CircleDot, Tag, ChevronDown } from "lucide-react";
import { useFiltersStore } from "../model/filters.store.ts";
import { useIssuesStore } from "../../../entities/issue/model/issues.store.ts";
import { useMemo, useState, useRef, useEffect } from "react";

export function FiltersBar() {
    const search = useFiltersStore((s) => s.search);
    const state = useFiltersStore((s) => s.state);
    const selectedLabels = useFiltersStore((s) => s.selectedLabels);
    const setSearch = useFiltersStore((s) => s.setSearch);
    const setState = useFiltersStore((s) => s.setState);
    const toggleLabel = useFiltersStore((s) => s.toggleLabel);
    const clearFilters = useFiltersStore((s) => s.clearFilters);

    const issues = useIssuesStore((s) => s.issues);

    const [labelsOpen, setLabelsOpen] = useState(false);
    const [stateOpen, setStateOpen] = useState(false);
    const labelsRef = useRef<HTMLDivElement>(null);
    const stateRef = useRef<HTMLDivElement>(null);

    const allLabels = useMemo(() => {
        const set = new Set<string>();
        issues.forEach((i) => i.labels?.forEach((l) => set.add(l)));
        return Array.from(set).sort();
    }, [issues]);

    const hasActiveFilters = search !== "" || state !== "all" || selectedLabels.length > 0;

    const stateOptions = [
        { value: "all" as const, label: "All states", dot: "" },
        { value: "open" as const, label: "Open", dot: "bg-green-500" },
        { value: "closed" as const, label: "Closed", dot: "bg-purple-500" },
    ];
    const currentState = stateOptions.find((o) => o.value === state) ?? stateOptions[0];

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (labelsRef.current && !labelsRef.current.contains(e.target as Node)) {
                setLabelsOpen(false);
            }
            if (stateRef.current && !stateRef.current.contains(e.target as Node)) {
                setStateOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div className="mb-6 rounded-2xl border border-border bg-card shadow-sm">
            <div className="h-1 rounded-t-2xl bg-linear-to-r from-indigo-500 via-purple-500 to-teal-500" />

            <div className="p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="relative flex-1 max-w-md">
                        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search issues..."
                            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/25"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground/50 transition hover:text-foreground"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="relative" ref={stateRef}>
                        <button
                            type="button"
                            onClick={() => setStateOpen(!stateOpen)}
                            className={`inline-flex h-9 w-36 items-center justify-between gap-2 rounded-lg border px-3 text-sm font-medium transition-colors ${
                                state !== "all"
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border bg-background text-foreground hover:bg-accent"
                            }`}
                        >
                            <span className="flex items-center gap-1.5">
                                {currentState.dot && (
                                    <span className={`inline-block h-2 w-2 rounded-full ${currentState.dot}`} />
                                )}
                                {currentState.label}
                            </span>
                            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${stateOpen ? "rotate-180" : ""}`} />
                        </button>

                        {stateOpen && (
                            <div className="absolute top-full left-0 z-[100] mt-1.5 min-w-36 rounded-xl border border-border bg-popover p-1.5 shadow-xl">
                                {stateOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => {
                                            setState(opt.value);
                                            setStateOpen(false);
                                        }}
                                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                                            state === opt.value
                                                ? "bg-primary/10 text-primary font-semibold"
                                                : "text-foreground hover:bg-muted"
                                        }`}
                                    >
                                        {opt.dot ? (
                                            <span className={`inline-block h-2 w-2 rounded-full ${opt.dot}`} />
                                        ) : (
                                            <CircleDot className="h-3.5 w-3.5 text-muted-foreground/50" />
                                        )}
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative" ref={labelsRef}>
                        <button
                            type="button"
                            onClick={() => setLabelsOpen(!labelsOpen)}
                            className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors ${
                                selectedLabels.length > 0
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border bg-background text-foreground hover:bg-accent"
                            }`}
                        >
                            <Tag className="h-3.5 w-3.5" />
                            Labels
                            {selectedLabels.length > 0 && (
                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                                    {selectedLabels.length}
                                </span>
                            )}
                        </button>

                        {labelsOpen && (
                            <div className="absolute top-full left-0 z-[100] mt-1.5 min-w-44 rounded-xl border border-border bg-popover p-1.5 shadow-xl">
                                {allLabels.length === 0 ? (
                                    <div className="px-3 py-2 text-xs text-muted-foreground">
                                        No labels
                                    </div>
                                ) : (
                                    allLabels.map((label) => {
                                        const active = selectedLabels.includes(label);
                                        return (
                                            <button
                                                key={label}
                                                type="button"
                                                onClick={() => toggleLabel(label)}
                                                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                                                    active
                                                        ? "bg-primary/10 text-primary font-medium"
                                                        : "text-foreground hover:bg-muted"
                                                }`}
                                            >
                                                <span
                                                    className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] transition ${
                                                        active
                                                            ? "border-primary bg-primary text-primary-foreground"
                                                            : "border-border"
                                                    }`}
                                                >
                                                    {active && "✓"}
                                                </span>
                                                {label}
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-muted-foreground transition hover:bg-red-50 hover:text-destructive hover:border-destructive"
                        >
                            <X className="h-3.5 w-3.5" />
                            Clear
                        </button>
                    )}
                </div>

                {hasActiveFilters && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
                        <span className="mr-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                            Active:
                        </span>

                        {state !== "all" && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-0.5 text-[11px] font-medium text-purple-600">
                                <CircleDot className="h-3 w-3" />
                                {state}
                                <button type="button" onClick={() => setState("all")} className="ml-0.5 rounded-sm hover:text-purple-800">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}

                        {selectedLabels.map((label) => (
                            <span
                                key={label}
                                className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-600"
                            >
                                <Tag className="h-3 w-3" />
                                {label}
                                <button type="button" onClick={() => toggleLabel(label)} className="ml-0.5 rounded-sm hover:text-blue-800">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}

                        {search && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600">
                                <Search className="h-3 w-3" />
                                "{search}"
                                <button type="button" onClick={() => setSearch("")} className="ml-0.5 rounded-sm hover:text-amber-800">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}