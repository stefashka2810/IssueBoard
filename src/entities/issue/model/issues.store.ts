import {create} from "zustand/react";
import {persist} from "zustand/middleware";
import type {Issue, Status} from "./schema.ts";
import type {IssuesStore} from "./types.ts";
import {useOperationLog} from "../../../features/sync/model/operationLog.ts";


export const useIssuesStore = create<IssuesStore>()(
    persist(
        (set) => ({
            issues: [],
            changeIssueStatus: (id: number, status: Status) => {
                const current = useIssuesStore.getState().issues.find(i => i.id === id);
                if (current?.status === status) return;

                set((state) => ({
                    issues: state.issues.map(issue =>
                        issue.id === id
                            ? { ...issue, status, updatedAt: Date.now() }
                            : issue
                    )
                }));

                const issue = useIssuesStore.getState().issues.find(i => i.id === id);
                if (issue) {
                    useOperationLog.getState().addOperation({
                        type: "change_status",
                        issueId: id,
                        issueNumber: issue.number,
                        payload: { status },
                    });
                }
            },
            setIssues: (issues) => set({ issues }),

            addIssue: (title: string, body?: string, labels?: string[]) => {
                const tempId = -Date.now();
                const issue: Issue = {
                    id: tempId,
                    number: tempId,
                    title,
                    labels: labels ?? [],
                    status: "todo",
                    state: "open",
                    updatedAt: Date.now(),
                };

                set((state) => ({ issues: [issue, ...state.issues] }));

                useOperationLog.getState().addOperation({
                    type: "create_issue",
                    issueId: tempId,
                    issueNumber: tempId,
                    payload: { title, body, labels },
                });

                return issue;
            },

            updateIssueId: (tempId: number, realId: number, realNumber: number) => {
                set((state) => ({
                    issues: state.issues.map((i) =>
                        i.id === tempId ? { ...i, id: realId, number: realNumber } : i
                    ),
                }));
            },
        }),
        {
            name: "issues-storage",
        }
    )
)