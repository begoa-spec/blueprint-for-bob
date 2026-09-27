import { BobSession, MistakeLogEntry, Severity } from '../types';

/**
 * IMPORTANT: Bob's real session export format isn't confirmed yet (we
 * haven't logged into Bob and seen one). This parser works generically
 * against markdown-style transcripts — lines starting with a speaker label
 * become prompt/response entries, and lines containing error-ish keywords
 * get flagged as candidate mistakes for review.
 *
 * Once you have a real .md export from Bob, paste one in and we tune the
 * regexes below to match its actual structure (speaker labels, section
 * headers, etc.) rather than guessing further.
 */

const MISTAKE_KEYWORDS =
  /\b(error|incorrect|wrong|failed|failure|hallucinat|revert|undo|mistake|broke|broken|bug)\b/i;

const BOB_LABEL = /^\s*(\*\*)?bob(\*\*)?\s*:/i;
const PROMPT_LABEL = /^\s*(\*\*)?(you|user|prompt)(\*\*)?\s*:/i;

export interface ParsedTranscript {
  logs: BobSession['logs'];
  candidateMistakes: Omit<MistakeLogEntry, 'id' | 'sessionRef' | 'detectedAt' | 'timesAvoidedSince' | 'status'>[];
}

export function parseTranscript(raw: string): ParsedTranscript {
  const rawLines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  const logs: BobSession['logs'] = [];
  const candidateMistakes: ParsedTranscript['candidateMistakes'] = [];

  let lastPrompt = '(no preceding prompt found in transcript)';
  let mistakeCounter = 0;
  // Tracks who's "speaking" across lines, since Bob's multi-line responses
  // don't repeat the speaker label on every line — only the first line of
  // a turn carries "**Bob:**" or "**You:**". Without this, continuation
  // lines would silently fall through to 'info' and get missed.
  let currentSpeaker: 'prompt' | 'bob' | null = null;

  rawLines.forEach((line, idx) => {
    const time = `L${idx + 1}`;
    let type: 'prompt' | 'bob_action' | 'blueprint_check' | 'correction' | 'info' = 'info';

    if (PROMPT_LABEL.test(line)) {
      currentSpeaker = 'prompt';
      type = 'prompt';
      lastPrompt = line.replace(PROMPT_LABEL, '').trim();
    } else if (BOB_LABEL.test(line)) {
      currentSpeaker = 'bob';
      type = MISTAKE_KEYWORDS.test(line) ? 'correction' : 'bob_action';
    } else if (MISTAKE_KEYWORDS.test(line)) {
      // A mistake keyword always wins regardless of whose turn it is —
      // don't let speaker tracking mask an actual flagged line.
      type = 'correction';
    } else if (currentSpeaker === 'bob') {
      // Continuation line of Bob's previous turn.
      type = 'bob_action';
    } else if (currentSpeaker === 'prompt') {
      type = 'prompt';
    }

    logs.push({ time, type, text: line });

    if (type === 'correction') {
      mistakeCounter += 1;
      const severity: Severity = /critical|security|secret/i.test(line) ? 'High' : 'Medium';
      candidateMistakes.push({
        title: line.length > 80 ? `${line.slice(0, 77)}...` : line,
        category: 'Code Hallucination',
        severity,
        bobPrompt: lastPrompt,
        errantBehavior: line,
        expectedBehavior: '(fill in what Bob should have done instead)'
      });
    }
  });

  return { logs, candidateMistakes };
}
