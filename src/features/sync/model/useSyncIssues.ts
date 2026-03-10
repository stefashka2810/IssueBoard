import { useMutation } from "@tanstack/react-query";
import {fetchRepoIssues, updateGithubIssue, createGithubIssue, GoneError} from "../../../entities/issue/api/github.ts";
import { mapGithubIssueToIssue } from "../../../entities/issue/model/mappers.ts";
import { useIssuesStore } from "../../../entities/issue/model/issues.store.ts";
import { useSettingsStore } from "../../settings/model/settings.store.ts";
import { useOperationLog, type Operation } from "./operationLog.ts";
import type { Issue, Status } from "../../../entities/issue/model/schema.ts";

const MAX_RETRIES = 5;
const BASE_DELAY = 1_000;

function delay(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

function backoffDelay(attempt: number) {
    return BASE_DELAY * Math.pow(2, attempt) + Math.random() * 500;
}

function statusToGithubState(status: Status): "open" | "closed" {
    return status === "done" ? "closed" : "open";
}

export interface SyncResult {
    pulled: number;
    pushed: number;
    conflicts: number;
}

export function useSyncIssues() {
    const setIssues = useIssuesStore((s) => s.setIssues);

    return useMutation<SyncResult>({
        mutationFn: async () => {
            const { repoFullName, token } = useSettingsStore.getState();
            if (!repoFullName || !token) {
                throw new Error("Configure repository and token in Settings first.");
            }

            const opLog = useOperationLog.getState();
            const pending = opLog.getPending();

            let pushCount = 0;
            const justCreatedIds = new Set<number>();

            // Deduplicate: for each issueId keep only the latest change_status
            const latestChangeStatus = new Map<number, string>();
            for (const op of pending) {
                if (op.type === "change_status") {
                    const existing = latestChangeStatus.get(op.issueId);
                    const existingOp = existing ? pending.find(o => o.id === existing) : undefined;
                    if (!existingOp || op.timestamp > existingOp.timestamp) {
                        latestChangeStatus.set(op.issueId, op.id);
                    }
                }
            }
            for (const op of pending) {
                if (op.type === "change_status" && latestChangeStatus.get(op.issueId) !== op.id) {
                    opLog.markSynced(op.id);
                }
            }

            for (const snapshotOp of pending) {
                // Re-read the operation from the store to pick up issueRef updates
                const freshOps = useOperationLog.getState().operations;
                const op = freshOps.find((o) => o.id === snapshotOp.id);
                if (!op || op.syncStatus !== "pending") continue;

                // Skip change_status for issues not yet created on GitHub
                if (op.type === "change_status" && op.issueNumber < 0) {
                    console.warn(`[sync] skipping change_status with temp issueNumber ${op.issueNumber}, removing operation ${op.id}`);
                    opLog.markSynced(op.id);
                    continue;
                }

                let success = false;

                for (let attempt = op.retries; attempt < MAX_RETRIES; attempt++) {
                    try {
                        const realId = await pushOperation(repoFullName, token, op);
                        if (realId != null) {
                            justCreatedIds.add(realId);
                        }
                        opLog.markSynced(op.id);
                        pushCount++;
                        success = true;
                        break;
                    } catch (_err: unknown) {
                        if (_err instanceof GoneError) {
                            console.warn(`[sync] issue gone, removing operation ${op.id}`);
                            opLog.markSynced(op.id);
                            const store = useIssuesStore.getState();
                            store.setIssues(store.issues.filter(i => i.number !== op.issueNumber));
                            success = true;
                            break;
                        }
                        opLog.incrementRetry(op.id);
                        if (attempt < MAX_RETRIES - 1) {
                            await delay(backoffDelay(attempt));
                        }
                        console.log(_err);
                    }
                }

                if (!success) {
                    console.warn(`[sync] gave up on operation ${op.id} after ${MAX_RETRIES} retries, removing`);
                    opLog.markSynced(op.id);
                }
            }

            const remoteIssues = await fetchRepoIssues(repoFullName, token);
            const localIssues = useIssuesStore.getState().issues;
            const localMap = new Map<number, Issue>();
            localIssues.forEach((i) => localMap.set(i.id, i));

            let conflictCount = 0;
            const merged: Issue[] = [];
            const mergedIds = new Set<number>();

            for (const gh of remoteIssues) {
                const local = localMap.get(gh.id);
                const remoteUpdatedAt = new Date(gh.updated_at).getTime();

                if (!local) {
                    merged.push(mapGithubIssueToIssue(gh));
                    mergedIds.add(gh.id);
                    continue;
                }

                const localState = statusToGithubState(local.status);
                const remoteState = gh.state;

                if (localState !== remoteState) {
                    const localUpdatedAt = local.updatedAt ?? 0;

                    if (localUpdatedAt > remoteUpdatedAt) {
                        merged.push({
                            ...mapGithubIssueToIssue(gh, local.status),
                            updatedAt: localUpdatedAt,
                        });
                    } else if (remoteUpdatedAt > localUpdatedAt) {
                        merged.push(mapGithubIssueToIssue(gh));
                    } else {
                        conflictCount++;
                        opLog.addOperation({
                            type: "change_status",
                            issueId: gh.id,
                            issueNumber: gh.number,
                            payload: { status: local.status },
                        });
                        const lastOps = useOperationLog.getState().operations;
                        const added = lastOps[lastOps.length - 1];
                        if (added) {
                            opLog.markConflict(added.id, gh.state);
                        }
                        merged.push(mapGithubIssueToIssue(gh));
                    }
                } else {
                    merged.push(mapGithubIssueToIssue(gh, local.status));
                }
                mergedIds.add(gh.id);
            }

            for (const local of localIssues) {
                if (!mergedIds.has(local.id) && (local.id < 0 || justCreatedIds.has(local.id))) {
                    merged.push(local);
                }
            }

            setIssues(merged);
            opLog.clearSynced();

            return { pulled: merged.length, pushed: pushCount, conflicts: conflictCount };
        },
    });
}

async function pushOperation(
    repoFullName: string,
    token: string,
    op: Operation,
): Promise<number | null> {
    if (op.type === "change_status" && op.payload.status) {
        await updateGithubIssue(repoFullName, token, op.issueNumber, {
            state: statusToGithubState(op.payload.status),
        });
        return null;
    } else if (op.type === "create_issue" && op.payload.title) {
        const created = await createGithubIssue(repoFullName, token, {
            title: op.payload.title,
            body: op.payload.body,
            labels: op.payload.labels,
        });
        useIssuesStore.getState().updateIssueId(op.issueId, created.id, created.number);
        useOperationLog.getState().updateIssueRef(op.issueId, created.id, created.number);
        return created.id;
    }
    return null;
}
