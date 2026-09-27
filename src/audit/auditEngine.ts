import { AuditIssue } from '../types';
import { CHECKS, TEST_MISSING_RULE } from './checks';

export interface SourceFile {
  path: string;
  content: string;
}

function makeIdFactory() {
  let counter = 0;
  return () => {
    counter += 1;
    return `ISS-${Date.now()}-${counter}`;
  };
}

const CODE_FILE = /\.(ts|tsx|js|jsx)$/;
const TEST_FILE = /(\.test\.|\.spec\.|__tests__\/)/;

/**
 * Runs the line-based pattern checks plus the file-level "no test found"
 * heuristic against a set of source files, returning issues shaped exactly
 * like the AuditIssue type the UI already renders.
 *
 * This is intentionally simple (regex over each line) rather than a real
 * AST parser — it runs instantly in the browser with zero dependencies,
 * which matters for a live hackathon demo. It will produce some false
 * positives/negatives; treat it as a fast first pass Bob's directives get
 * layered on top of, not a full static analyzer.
 */
export function runAudit(files: SourceFile[]): AuditIssue[] {
  const nextId = makeIdFactory();
  const issues: AuditIssue[] = [];

  const codeFiles = files.filter((f) => CODE_FILE.test(f.path));
  const testedBasenames = new Set(
    codeFiles
      .filter((f) => TEST_FILE.test(f.path))
      .map((f) => justName(f.path).replace(/\.(test|spec)$/, ''))
  );

  for (const file of codeFiles) {
    const lines = file.content.split('\n');

    for (const check of CHECKS) {
      if (check.fileFilter && !check.fileFilter.test(file.path)) continue;

      lines.forEach((line, idx) => {
        if (check.pattern.test(line)) {
          issues.push({
            id: nextId(),
            fileName: file.path,
            line: idx + 1,
            issue: check.issue,
            severity: check.severity,
            category: check.category,
            ruleId: check.ruleId,
            suggestion: check.suggestion,
            snippet: line.trim().slice(0, 200)
          });
        }
      });
    }

    // File-level: does this source file have a matching test file anywhere?
    if (!TEST_FILE.test(file.path)) {
      const base = justName(file.path);
      if (!testedBasenames.has(base) && /^[A-Z]/.test(base)) {
        // Heuristic scope: only flag PascalCase files (components/classes),
        // to avoid flooding results with every tiny util file.
        issues.push({
          id: nextId(),
          fileName: file.path,
          line: 1,
          issue: TEST_MISSING_RULE.issue,
          severity: TEST_MISSING_RULE.severity,
          category: TEST_MISSING_RULE.category,
          ruleId: TEST_MISSING_RULE.ruleId,
          suggestion: TEST_MISSING_RULE.suggestion
        });
      }
    }
  }

  return issues;
}

function justName(path: string): string {
  const fileName = path.split('/').pop() || path;
  return fileName.replace(/\.(ts|tsx|js|jsx)$/, '');
}
