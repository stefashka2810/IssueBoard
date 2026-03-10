import { GithubIssueSchema, type GithubIssue } from "../model/github-schema.ts";
import { z } from "zod";

const BASE_URL = "https://api.github.com";

function headers(token: string) {
    return {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
    };
}


export async function fetchRepoIssues(
    repoFullName: string,
    token: string,
): Promise<GithubIssue[]> {
    const allIssues: GithubIssue[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
        const url = `${BASE_URL}/repos/${repoFullName}/issues?state=all&per_page=${perPage}&page=${page}`;
        const res = await fetch(url, { headers: headers(token) });

        if (!res.ok) {
            const body = await res.text();
            throw new Error(`GitHub API error ${res.status}: ${body}`);
        }

        const data = await res.json();
        const parsed = z.array(GithubIssueSchema).parse(data);

        const issues = parsed.filter((i) => !i.pull_request);
        allIssues.push(...issues);

        if (parsed.length < perPage) break;
        page++;
    }

    return allIssues;
}


export async function createGithubIssue(
    repoFullName: string,
    token: string,
    payload: {
        title: string;
        body?: string;
        labels?: string[];
    },
): Promise<GithubIssue> {
    const url = `${BASE_URL}/repos/${repoFullName}/issues`;
    const res = await fetch(url, {
        method: "POST",
        headers: {
            ...headers(token),
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`GitHub API error ${res.status}: ${body}`);
    }

    const data = await res.json();
    return GithubIssueSchema.parse(data);
}


export class GoneError extends Error {
    constructor(status: number, body: string) {
        super(`GitHub API ${status}: ${body}`);
        this.name = "GoneError";
    }
}


export async function updateGithubIssue(
    repoFullName: string,
    token: string,
    issueNumber: number,
    payload: {
        title?: string;
        state?: "open" | "closed";
        labels?: string[];
    },
): Promise<void> {
    const url = `${BASE_URL}/repos/${repoFullName}/issues/${issueNumber}`;
    const res = await fetch(url, {
        method: "PATCH",
        headers: {
            ...headers(token),
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const body = await res.text();
        if (res.status === 404 || res.status === 410) {
            throw new GoneError(res.status, body);
        }
        throw new Error(`GitHub API error ${res.status}: ${body}`);
    }
}
