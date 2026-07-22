# Context for frontend POC workflow

Project: agent1-frontend-poc

## Current goals
- Ensure the saved test case names accurately extract and prefer the Agent 1 "Script Name" output, bypassing Markdown and JSON serialization issues.
- Bind the "Play" action on saved rows to Agent 2 (`connection2`).
- Provide an isolated loading state (⏳) on the specific test case being played via Agent 2.
- Resolve Agent 2 authentication configuration to seamlessly utilize the frontend SSO token instead of returning an OAuth sign-in card.
- Plan for future refactoring of `Chat.tsx` into smaller utility files, hooks, and sub-components.

## Key files
- `src/Chat.tsx`: main workflow UI, response parsing, save/play handlers, and saved-item state.
- `src/settings.js`: Agent connection settings, including Agent 2 direct-connect URL and Entra ID Client ID.
- `src/acquireToken.ts`: authentication/token acquisition for Copilot Studio connections.

## Current implementation notes
- The UI includes a generated preview card and a saved-test-case list.
- `extractCsvFileName` in `Chat.tsx` has been updated to strip Markdown (`**`) and unescape literal newlines (`\n`) to properly parse the Script Name from the raw JSON activity string.
- Prompts for `generateOutput` and `sendChanges` explicitly ask Agent 1 to output the "Script Name:".
- The Play button correctly maps to Agent 2 and utilizes a `playingTestCaseId` state to show a loading indicator and disable the button while executing.
- The `connection2` (Agent 2) activity stream is successfully subscribed to upon initialization, fixing the "Activity subscriber is not initialized" error.
- Agent 2 is currently returning an OAuth/Sign-in requirement. This requires updating Agent 2's authentication settings in Copilot Studio to match Agent 1's SSO configuration (or disabling auth on Agent 2 temporarily for testing).

## Verification status
- Frontend successfully extracts names and saves runs locally.
- Agent 2 connection is established and active.
- Agent 2 execution is currently blocked by Copilot Studio backend Authentication/SSO settings.