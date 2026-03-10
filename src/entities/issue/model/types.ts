import type {Issue, Status} from "./schema.ts";

export interface IssuesStore {
    issues: Issue[];
    changeIssueStatus: (id: number, status: Status) => void;
    setIssues: (issues: Issue[]) => void;
    addIssue: (title: string, body?: string, labels?: string[]) => Issue;
    updateIssueId: (tempId: number, realId: number, realNumber: number) => void;
}