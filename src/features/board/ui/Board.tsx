import { useMemo, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Settings, RefreshCw, CheckCircle2, AlertCircle, WifiOff, Wifi, AlertTriangle, ArrowRight, Plus } from "lucide-react";
import Column from "./Column.tsx";
import { CreateIssueModal } from "./CreateIssueModal.tsx";
import type {Issue, Status} from "../../../entities/issue/model/schema.ts";
import {DragDropProvider} from "@dnd-kit/react";
import {useIssuesStore} from "../../../entities/issue/model/issues.store.ts";
import {useFiltersStore} from "../../filters/model/filters.store.ts";
import {FiltersBar} from "../../filters/ui/FiltersBar.tsx";
import {useSyncIssues} from "../../sync/model/useSyncIssues.ts";
import {useSettingsStore} from "../../settings/model/settings.store.ts";
import {useOperationLog} from "../../sync/model/operationLog.ts";
import {useOnlineStatus} from "../../../shared/lib/useOnlineStatus.ts";

const STATUS_LABELS: Record<string, string> = {
    todo: "To Do",
    in_progress: "In Progress",
    done: "Done",
};

function Board() {
    const issues = useIssuesStore((state) => state.issues);
    const moveIssue = useIssuesStore((state) => state.changeIssueStatus);
    const addIssue = useIssuesStore((state) => state.addIssue);

    const [showCreate, setShowCreate] = useState(false);

    const search = useFiltersStore((s) => s.search);
    const stateFilter = useFiltersStore((s) => s.state);
    const selectedLabels = useFiltersStore((s) => s.selectedLabels);

    const repoFullName = useSettingsStore((s) => s.repoFullName);
    const token = useSettingsStore((s) => s.token);
    const isConfigured = !!repoFullName && !!token;

    const sync = useSyncIssues();

    const operations = useOperationLog((s) => s.operations);
    const removeOperation = useOperationLog((s) => s.removeOperation);
    const conflicts = useMemo(() => operations.filter((o) => o.syncStatus === "conflict"), [operations]);

    const isOnline = useOnlineStatus();

    const wasOffline = useRef(false);
    useEffect(() => {
        if (!isOnline) {
            wasOffline.current = true;
            return;
        }
        if (wasOffline.current) {
            wasOffline.current = false;
            const { repoFullName: repo, token: tok } = useSettingsStore.getState();
            const hasPending = useOperationLog.getState().getPending().length > 0;
            if (repo && tok && hasPending) {
                sync.mutate();
            }
        }
    }, [isOnline]);

    const filteredIssues = useMemo(() => {
        return issues.filter((issue) => {
            if (search && !issue.title.toLowerCase().includes(search.toLowerCase())) {
                return false;
            }
            if (stateFilter !== "all" && issue.state !== stateFilter) {
                return false;
            }
            return !(selectedLabels.length > 0 &&
                !selectedLabels.some((l) => issue.labels?.includes(l)));

        });
    }, [issues, search, stateFilter, selectedLabels]);

    const columns: {id: Status; title: string;}[] = [
        { id: "todo", title: "To Do" },
        { id: "in_progress", title: "In Progress" },
        { id: "done", title: "Done" },
    ];

    const resolveConflict = (opId: string, choice: "local" | "remote", op: typeof conflicts[0]) => {
        if (choice === "local" && op.payload.status) {
            moveIssue(op.issueId, op.payload.status);
        }
        removeOperation(opId);
    };

    return (
        <DragDropProvider
            onDragEnd={(event) => {
                if (event.canceled) return;

                const source = event.operation.source;
                const target = event.operation.target;
                if (source == null || target == null) return;

                let targetColumnId: string | undefined;
                if (target.type === "column") {
                    targetColumnId = String(target.id);
                } else if (target.type === "issue") {
                    const targetIssue = issues.find(i => i.id === Number(target.id));
                    targetColumnId = targetIssue?.status;
                }
                if (!targetColumnId) return;

                const validStatuses: Status[] = ["todo", "in_progress", "done"];
                if (!validStatuses.includes(targetColumnId as Status)) return;

                const sourceIssue = issues.find(i => i.id === Number(source.id));
                if (sourceIssue?.status === targetColumnId) return;

                moveIssue(Number(source.id), targetColumnId as Status);
            }}
        >
            {!isOnline && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 shadow-sm">
                    <WifiOff className="h-4 w-4 shrink-0" />
                    <span><strong>Offline</strong> — изменения сохраняются локально и синхронизируются при подключении.</span>
                </div>
            )}

            <div className="mb-6 shrink-0 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Issue Board
                    </h1>
                    {isOnline ? (
                        <span title="Online"><Wifi className="h-4 w-4 text-emerald-500" /></span>
                    ) : (
                        <span title="Offline"><WifiOff className="h-4 w-4 text-amber-500" /></span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to="/settings"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm transition hover:bg-accent hover:text-foreground"
                        title="Настройки"
                    >
                        <Settings className="h-4 w-4" />
                    </Link>

                    <button
                        type="button"
                        onClick={() => sync.mutate()}
                        disabled={sync.isPending || !isConfigured || !isOnline}
                        title={!isConfigured ? "Настройте репо и токен" : !isOnline ? "Нет сети" : "Синхронизировать с GitHub"}
                        className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed ${
                            sync.isError
                                ? "border-destructive/50 bg-destructive/5 text-destructive hover:bg-destructive/10"
                                : sync.isSuccess
                                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                    : "border-border bg-card text-foreground hover:bg-accent"
                        }`}
                    >
                        {sync.isPending ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : sync.isSuccess ? (
                            <CheckCircle2 className="h-4 w-4" />
                        ) : sync.isError ? (
                            <AlertCircle className="h-4 w-4" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                        {sync.isPending
                            ? "Синк…"
                            : sync.isSuccess
                                ? `Синхронизовано`
                                : sync.isError
                                    ? "Ошибка синка"
                                    : "Синк"}
                    </button>

                    {isConfigured && (
                        <button
                            type="button"
                            onClick={() => setShowCreate(true)}
                            className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
                        >
                            <Plus className="h-4 w-4" />
                            Новый Issue
                        </button>
                    )}
                </div>
            </div>

            {conflicts.length > 0 && (
                <div className="mb-4 space-y-2">
                    {conflicts.map((c) => {
                        const issue = issues.find(i => i.id === c.issueId);
                        return (
                            <div key={c.id} className="flex items-center gap-3 rounded-lg border border-orange-300 bg-orange-50 px-4 py-3 text-sm shadow-sm">
                                <AlertTriangle className="h-5 w-5 shrink-0 text-orange-600" />
                                <div className="flex-1 min-w-0">
                                    <span className="font-semibold text-orange-900">Conflict</span>
                                    <span className="ml-1 text-orange-800">
                                        #{c.issueNumber} {issue?.title ?? "Unknown issue"}
                                    </span>
                                    <div className="mt-0.5 text-xs text-orange-700">
                                        Local: <strong>{STATUS_LABELS[c.payload.status ?? ""] ?? c.payload.status ?? "?"}</strong>
                                        <ArrowRight className="mx-1 inline h-3 w-3" />
                                        Remote: <strong>{c.conflictRemoteState === "closed" ? "Closed" : "Open"}</strong>
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button
                                        onClick={() => resolveConflict(c.id, "local", c)}
                                        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                                    >
                                        Keep Local
                                    </button>
                                    <button
                                        onClick={() => resolveConflict(c.id, "remote", c)}
                                        className="rounded-md border border-orange-300 bg-white px-3 py-1.5 text-xs font-medium text-orange-800 transition hover:bg-orange-100"
                                    >
                                        Accept Remote
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!isConfigured ? (
                <div className="flex flex-1 items-center justify-center">
                    <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
                        <Settings className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                        <h2 className="mb-2 text-xl font-semibold text-foreground">Репозиторий не подключён</h2>
                        <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
                            Настройте GitHub-репозиторий и токен доступа, чтобы начать работу с задачами на доске.
                        </p>
                        <Link
                            to="/settings"
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
                        >
                            <Settings className="h-4 w-4" />
                            Перейти в настройки
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                    <FiltersBar />

                    <div className="grid flex-1 min-h-0 grid-cols-1 gap-4 md:grid-cols-3">
                        {columns.map((col) => (
                            <Column
                                key={col.id}
                                id={col.id}
                                title={col.title}
                                issues={filteredIssues.filter((issue: Issue)=> issue.status === col.id)}
                            />
                        ))}
                    </div>
                </>
            )}

            <CreateIssueModal
                open={showCreate}
                onClose={() => setShowCreate(false)}
                onCreate={(title, body, labels) => {
                    addIssue(title, body || undefined, labels.length > 0 ? labels : undefined);
                }}
            />
        </DragDropProvider>
    );
}

export default Board;