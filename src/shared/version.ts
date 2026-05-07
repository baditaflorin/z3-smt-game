export const appVersion = import.meta.env.VITE_APP_VERSION || "0.1.0";
export const gitCommit = import.meta.env.VITE_GIT_COMMIT || "dev";

export function shortCommit(commit: string): string {
  return commit.length > 7 ? commit.slice(0, 7) : commit;
}
