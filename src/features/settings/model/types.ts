export interface SettingsStore {
    repoFullName: string;
    token: string;
    setRepoFullName: (value: string) => void;
    setToken: (value: string) => void;
}