import { SourceFile } from '../audit/auditEngine';

const CODE_FILE = /\.(ts|tsx|js|jsx)$/;
const MAX_FILES = 40; // keep the live demo fast and stay well under GitHub's unauthenticated rate limit
const MAX_FILE_BYTES = 60_000; // skip huge generated/bundled files

export class GitHubFetchError extends Error {}

export function parseRepoUrl(url: string): { owner: string; repo: string } {
  const cleaned = url.trim().replace(/\/+$/, '').replace(/\.git$/, '');
  const match = cleaned.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    throw new GitHubFetchError('Enter a valid GitHub repo URL, e.g. https://github.com/owner/repo');
  }
  return { owner: match[1], repo: match[2] };
}

interface TreeEntry {
  path: string;
  type: 'blob' | 'tree';
  size?: number;
  url: string;
}

/**
 * Fetches up to MAX_FILES code files (by content) from a public GitHub repo
 * using the unauthenticated REST API. No token required, but subject to
 * GitHub's 60 requests/hour unauthenticated rate limit — fine for a live
 * demo of one or two repos, not for repeated heavy use.
 */
export async function fetchRepoFiles(
  repoUrl: string,
  branch: string,
  onProgress?: (text: string) => void
): Promise<SourceFile[]> {
  const { owner, repo } = parseRepoUrl(repoUrl);

  onProgress?.(`Resolving default branch for ${owner}/${repo}...`);
  const resolvedBranch = branch && branch.trim() ? branch.trim() : await resolveDefaultBranch(owner, repo);

  onProgress?.('Fetching repository file tree...');
  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${resolvedBranch}?recursive=1`
  );
  if (!treeRes.ok) {
    throw new GitHubFetchError(
      treeRes.status === 403
        ? 'GitHub API rate limit hit. Wait a few minutes and try again.'
        : `Could not read repo tree (HTTP ${treeRes.status}). Check the URL and branch.`
    );
  }
  const treeData = await treeRes.json();
  const entries: TreeEntry[] = treeData.tree || [];

  const codeFiles = entries
    .filter((e) => e.type === 'blob' && CODE_FILE.test(e.path) && (e.size ?? 0) < MAX_FILE_BYTES)
    .slice(0, MAX_FILES);

  onProgress?.(`Downloading ${codeFiles.length} source files...`);

  const files: SourceFile[] = [];
  // Sequential, small delay-free fetches — simpler than batching promise
  // pools, and MAX_FILES keeps this well within a demo-friendly wait time.
  for (const entry of codeFiles) {
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${resolvedBranch}/${entry.path}`;
    const res = await fetch(rawUrl);
    if (res.ok) {
      files.push({ path: entry.path, content: await res.text() });
    }
  }

  return files;
}

async function resolveDefaultBranch(owner: string, repo: string): Promise<string> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
  if (!res.ok) throw new GitHubFetchError(`Repo not found or private: ${owner}/${repo}`);
  const data = await res.json();
  return data.default_branch || 'main';
}
