/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from 'react'

import { styles } from '../styles'

type GeneratedPreviewCardProps = {
  csvOutput: string
  agent2Instruction: string
  canApprove: boolean
  isLoading: boolean
  isSaved: boolean
  onApproveAndSave: () => void
}

function GeneratedPreviewCard({
  csvOutput,
  agent2Instruction,
  canApprove,
  isLoading,
  isSaved,
  onApproveAndSave
}: GeneratedPreviewCardProps) {
  const disabled = !canApprove || isLoading || isSaved

  return (
    <div style={styles.outputCard}>
      <div style={styles.outputHeader}>
        <div>
          <h2 style={styles.cardTitle}>Generated Test Case Preview</h2>
          <p style={styles.cardDescription}>Review the generated CSV and Agent 2 instruction before saving.</p>
        </div>
        <span style={styles.outputTagPurple}>Preview</span>
      </div>

      <div style={styles.previewSection}>
        <div style={styles.previewLabel}>Generated CSV</div>
        <textarea
          value={csvOutput || 'Generate output to preview the CSV test cases.'}
          readOnly
          style={styles.csvBox}
        />

        <div style={styles.previewLabel}>Agent 2 instruction</div>
        <textarea
          value={agent2Instruction || 'Generate output to preview the Agent 2 execution instruction.'}
          readOnly
          style={styles.agentInstructionBox}
        />

        <div style={styles.buttonRow}>
          <button
            onClick={onApproveAndSave}
            disabled={disabled}
            style={disabled ? styles.successButtonDisabled : styles.successButton}
          >
            {isSaved ? 'Saved' : 'Approve & Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default GeneratedPreviewCard
