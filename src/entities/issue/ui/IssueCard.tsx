import type { Issue } from "../model/schema.ts";
import {useDraggable} from "@dnd-kit/react";

const stateColors: Record<string, string> = {
    open: "bg-green-500",
    closed: "bg-purple-500",
};

type IssueCardProps = {
    issue: Issue;
};

function IssueCard({ issue }: IssueCardProps) {
    const {ref} = useDraggable({id: issue.id, type: "issue"});
    return (
        <div ref={ref} className="group relative rounded-xl border border-border bg-card p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/40">
            <div className="absolute top-3.5 right-3.5">
                <span
                    className={`block h-2 w-2 rounded-full ${stateColors[issue.state] ?? "bg-gray-400"}`}
                    title={issue.state}
                />
            </div>

            <span className="mb-1.5 block text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                #{issue.number}
            </span>

            <h3 className="mb-2.5 line-clamp-2 text-sm font-semibold leading-snug text-foreground pr-4">
                {issue.title}
            </h3>

            {issue.labels?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                    {issue.labels.slice(0, 3).map((label) => (
                        <span
                            key={label}
                            className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-medium leading-none text-indigo-600 border border-indigo-200"
                        >
                            {label}
                        </span>
                    ))}
                    {issue.labels.length > 3 && (
                        <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-medium leading-none text-indigo-600 border border-indigo-200">
                            +{issue.labels.length - 3}
                        </span>
                    )}
                </div>
            ) : (
                <span className="text-[10px] italic text-muted-foreground">No labels</span>
            )}
        </div>
    );
}

export default IssueCard;
