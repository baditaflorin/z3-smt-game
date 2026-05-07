export const appVersion = __APP_VERSION__;
export const gitCommit = __GIT_COMMIT__;

export function shortCommit(commit: string): string {
  return commit.length > 7 ? commit.slice(0, 7) : commit;
}
