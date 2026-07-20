# Context for frontend POC workflow

Project: agent1-frontend-poc

## Current goals
- Continue the saved-test-case workflow improvements in the React/TypeScript frontend.
- Ensure saved rows can be selected to view details.
- Ensure the play action uses Agent 2 via the second direct-connect endpoint.
- Ensure saved names prefer the Agent 1 script-name output when available.

## Key files
- src/Chat.tsx: main workflow UI, response parsing, save/play handlers, and saved-item state.
- src/settings.js: Agent connection settings, including Agent 2 direct-connect URL.
- src/acquireToken.ts: authentication/token acquisition for Copilot Studio connections.

## Current implementation notes
- The UI now includes a generated preview card and a saved-test-case list.
- Approve & Save is placed near the generated preview.
- A duplicate-save guard prevents saving the same generated output twice until a new generation occurs.
- Saved rows can be clicked to open a detail panel.
- The play button should target Agent 2 for execution.
- Saved row names should prefer the Agent 1 "Script Name" output over the CSV filename if present.

## Verification status
- Editor diagnostics for src/Chat.tsx currently show no errors.
- Build verification was not run because the user skipped the earlier build command.
