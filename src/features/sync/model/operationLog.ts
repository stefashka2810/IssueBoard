import { create } from "zustand/react";
import { persist } from "zustand/middleware";
import type { Status } from "../../../entities/issue/model/schema.ts";

export type OperationType = "change_status" | "create_issue";

export interface Operation {
    id: string;
    type: OperationType;
    issueId: number;
    issueNumber: number;
    payload: { status?: Status; title?: string; body?: string; labels?: string[] };
    timestamp: number;
    retries: number;
    syncStatus: "pending" | "synced" | "conflict";
    conflictRemoteState?: string;
}

export interface OperationLogStore {
    operations: Operation[];
    addOperation: (op: Omit<Operation, "id" | "timestamp" | "retries" | "syncStatus">) => void;
    markSynced: (id: string) => void;
    markConflict: (id: string, remoteState: string) => void;
    incrementRetry: (id: string) => void;
    removeOperation: (id: string) => void;
    clearSynced: () => void;
    getPending: () => Operation[];
    getConflicts: () => Operation[];
    updateIssueRef: (oldIssueId: number, newIssueId: number, newIssueNumber: number) => void;
}

export const useOperationLog = create<OperationLogStore>()(
    persist(
        (set, get) => ({
            operations: [],

            addOperation: (op) =>
                set((s) => ({
                    operations: [
                        ...s.operations,
                        {
                            ...op,
                            id: `${op.issueId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                            timestamp: Date.now(),
                            retries: 0,
                            syncStatus: "pending" as const,
                        },
                    ],
                })),

            markSynced: (id) =>
                set((s) => ({
                    operations: s.operations.map((o) =>
                        o.id === id ? { ...o, syncStatus: "synced" as const } : o
                    ),
                })),

            markConflict: (id, remoteState) =>
                set((s) => ({
                    operations: s.operations.map((o) =>
                        o.id === id
                            ? { ...o, syncStatus: "conflict" as const, conflictRemoteState: remoteState }
                            : o
                    ),
                })),

            incrementRetry: (id) =>
                set((s) => ({
                    operations: s.operations.map((o) =>
                        o.id === id ? { ...o, retries: o.retries + 1 } : o
                    ),
                })),

            removeOperation: (id) =>
                set((s) => ({
                    operations: s.operations.filter((o) => o.id !== id),
                })),

            clearSynced: () =>
                set((s) => ({
                    operations: s.operations.filter((o) => o.syncStatus !== "synced"),
                })),

            getPending: () => get().operations.filter((o) => o.syncStatus === "pending"),

            getConflicts: () => get().operations.filter((o) => o.syncStatus === "conflict"),

            updateIssueRef: (oldIssueId, newIssueId, newIssueNumber) =>
                set((s) => ({
                    operations: s.operations.map((o) =>
                        o.issueId === oldIssueId
                            ? { ...o, issueId: newIssueId, issueNumber: newIssueNumber }
                            : o
                    ),
                })),
        }),
        {
            name: "operation-log",
        }
    )
);
