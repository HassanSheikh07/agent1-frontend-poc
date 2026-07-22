/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 *
 * Prompt templates sent to the agents. The marker lines (---CSV START--- and
 * friends) are what lib/textExtraction.ts parses back out of the replies, so
 * the two files must stay in step.
 */

import { SavedTestCase } from '../types'

export function buildGeneratePrompt(instruction: string): string {
  return `
User request:
${instruction}

Generate the CSV test case data and Agent 2 execution instruction.

Important:
- Do not save anything yet.
- Do not call SharePoint yet.
- Do not call Dataverse yet.
- Do not execute test cases.
- Do not call Agent 2.
- Create only the required output for the user request.

Display both outputs and ask for approval.

Use this exact format:

Script Name:
<script-name>

CSV File Name:
<csv-file-name.csv>

Generated CSV Test Cases:

---CSV START---
<valid CSV content>
---CSV END---

Agent 2 Execution Instruction:

---AGENT2 INSTRUCTION START---
<plain text Agent 2 instruction>
---AGENT2 INSTRUCTION END---

Please review the generated CSV test cases and Agent 2 execution instruction. Reply Yes, Approved, Proceed, or Save if you want me to save this. If changes are needed, tell me what to update.
`
}

export function buildRevisionPrompt(feedback: string): string {
  return `
Please revise the generated outputs based on the following feedback:

${feedback}

Important:
- Do not save anything yet.
- Do not call SharePoint yet.
- Do not call Dataverse yet.
- Do not execute test cases.
- Do not call Agent 2.

Show the revised CSV test cases and Agent 2 execution instruction again for approval.

Use this exact format:

Script Name:
<revised-script-name>

CSV File Name:
<csv-file-name.csv>

Generated CSV Test Cases:

---CSV START---
<valid revised CSV content>
---CSV END---

Agent 2 Execution Instruction:

---AGENT2 INSTRUCTION START---
<revised plain text Agent 2 instruction>
---AGENT2 INSTRUCTION END---
`
}

export function buildApprovalPrompt(): string {
  return `
Approved. Please proceed with saving.

Use the final generated CSV test cases and Agent 2 execution instruction already generated in this conversation.

Now follow the approved save process:
1. Call the Save-Generated-CSV-To-SharePoint flow first.
2. Pass only:
   - csvFileName
   - csvContent
3. Do not pass Agent 2 instruction to the SharePoint flow.
4. After the SharePoint flow returns the file link, save the Dataverse record using the existing Dataverse tool.
5. Include the CSV content, Agent 2 execution instruction, source prompt, and SharePoint CSV link in Dataverse.

Important:
- Do not execute test cases.
- Do not open Dynamics 365 Finance & Operations.
- Do not use Computer Use.
- Do not call Agent 2.

Final response after saving:
Test script saved successfully.
Script Name:
CSV File Name:
SharePoint CSV Link:
`
}

export function buildPlayTestCasePrompt(testCase: SavedTestCase): string {
  return `
Play the saved test case: ${testCase.name}

Use the saved CSV content and instruction for this test case.

CSV Content:
${testCase.csvContent}

Agent 2 Instruction:
${testCase.instruction}
`
}
