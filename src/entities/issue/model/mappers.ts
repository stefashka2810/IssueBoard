import type { GithubIssue } from "./github-schema.ts";
import type { Issue, Status } from "./schema.ts";

export function mapGithubIssueToIssue(
    gh: GithubIssue,
    existingStatus?: Status,
): Issue {
    const status: Status = existingStatus ?? (gh.state === "closed" ? "done" : "todo");

    return {
        id: gh.id,
        number: gh.number,
        title: gh.title,
        state: gh.state,
        labels: gh.labels.map((l) => l.name),
        status,
        updatedAt: new Date(gh.updated_at).getTime(),
    };
}
