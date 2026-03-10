import type { Issue } from "../../../entities/issue/model/schema.ts";
import IssueCard from "../../../entities/issue/ui/IssueCard.tsx";
import { useDroppable } from "@dnd-kit/react";

const columnAccent: Record<string, { bar: string; badge: string; icon: string }> = {
    todo: {
        bar: "bg-amber-400",
        badge: "bg-amber-400/15 text-amber-600",
        icon: "○",
    },
    in_progress: {
        bar: "bg-blue-500",
        badge: "bg-blue-400/15 text-blue-600",
        icon: "◑",
    },
    done: {
        bar: "bg-emerald-500",
        badge: "bg-emerald-400/15 text-emerald-600",
        icon: "●",
    },
};

type ColumnProps = {
    id: string;
    title: string;
    issues: Issue[];
};

function Column({ id, title, issues }: ColumnProps) {
    const accent = columnAccent[id] ?? columnAccent.todo;
    const { ref } = useDroppable({ id, type: "column" });

    return (
        <div
            ref={ref}
            className="flex h-full min-h-0 flex-col rounded-2xl border border-border bg-card shadow-sm"
        >
            {/* Accent bar */}

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="text-base select-none" aria-hidden>
                        {accent.icon}
                    </span>
                    <h2 className="text-sm font-semibold tracking-tight text-foreground">
                        {title}
                    </h2>
                </div>
                <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${accent.badge}`}
                >
                    {issues.length}
                </span>
            </div>

            {/* Divider */}
            <div className="mx-3 border-t border-border" />

            {/* Card list */}
            <div className="flex-1 min-h-0 overflow-y-auto p-2">
                {issues.length === 0 ? (
                    <div className="flex h-full min-h-32 items-center justify-center rounded-xl border border-dashed border-border bg-muted text-xs text-muted-foreground">
                        No issues yet
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {issues.map((issue) => (
                            <IssueCard key={issue.id} issue={issue} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Column;