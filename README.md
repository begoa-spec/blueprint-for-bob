# Blueprint for Bob

Coding agents forget. Every new Bob session starts from zero, with no memory of past mistakes and no enforced record of your team's coding standards. Blueprint for Bob closes that gap.

Built for the IBM Bob 2.0 Hackathon (lablab.ai).

## What it does

- **Audits a real GitHub repo** against a set of coding standards, scanning actual file contents for issues like hardcoded secrets, unhandled async calls, missing tests, and more
- **Exports standards as a real `.bobrules` file** — plain markdown, in the exact format Bob reads and injects into every conversation
- **Imports Bob session transcripts**, automatically detecting likely mistakes from the session log
- **Turns any logged mistake into a new standard** with one click, so the same error gets caught automatically next time
- **Scores overall repo health** with a weighted severity score (A–F grade) based on open audit issues
- **Generates a client-ready handover report** summarizing standards, open issues, and known mistake patterns in one readable document

## Tech stack

React 19, TypeScript, Vite, Tailwind CSS. No backend — audits run client-side against the GitHub REST API.

## Running locally