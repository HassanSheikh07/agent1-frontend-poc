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
  isSaving: boolean
  isSaved: boolean
  onApproveAndSave: () => void
}

function GeneratedPreviewCard({
  csvOutput,
  agent2Instruction,
  canApprove,
  isLoading,
  isSaving,
  isSaved,
  onApproveAndSave
}: GeneratedPreviewCardProps) {
  const disabled =
    !canApprove || isLoading || isSaving || isSaved

  return (
    <section
      className='relay-card relay-card--teal'
      style={styles.outputCard}
    >
      <div className='relay-card-head'>
        <div>
          <div className='relay-eyebrow'>
            Handoff package
          </div>

          <h2 style={styles.cardTitle}>
            Inspect the generated output
          </h2>

          <p style={styles.cardDescription}>
            Verify both artifacts before the review
            gate commits the CSV and Agent 2
            execution instruction.
          </p>
        </div>

        <span style={styles.outputTagPurple}>
          Draft package
        </span>
      </div>

      <div className='relay-preview-grid'>
        <div className='relay-preview-pane'>
          <div className='relay-preview-pane__head'>
            <div style={styles.previewLabel}>
              Generated CSV
            </div>

            <span className='relay-preview-pane__badge'>
              Data artifact
            </span>
          </div>

          <textarea
            value={
              csvOutput ||
              'Generate a scenario to preview the structured CSV test data.'
            }
            readOnly
            style={styles.csvBox}
          />
        </div>

        <div className='relay-preview-pane'>
          <div className='relay-preview-pane__head'>
            <div style={styles.previewLabel}>
              Agent 2 instruction
            </div>

            <span className='relay-preview-pane__badge'>
              Relay artifact
            </span>
          </div>

          <textarea
            value={
              agent2Instruction ||
              'Generate a scenario to preview the execution instruction that will be relayed to Agent 2.'
            }
            readOnly
            style={styles.agentInstructionBox}
          />
        </div>
      </div>

      <div className='relay-action-row'>
        <span className='relay-action-note'>
          Approval saves the current package but does
          not execute it automatically.
        </span>

        <button
          type='button'
          className='relay-button'
          onClick={onApproveAndSave}
          disabled={disabled}
          style={
            disabled
              ? styles.successButtonDisabled
              : styles.successButton
          }
        >
          {isSaving ? (
            <span
              className='relay-spinner'
              aria-hidden='true'
            />
          ) : (
            <span
              className='relay-button__icon'
              aria-hidden='true'
            >
              ✓
            </span>
          )}
          {isSaving
            ? 'Saving package…'
            : isSaved
              ? 'Package saved'
              : 'Approve and save'}
        </button>
      </div>
    </section>
  )
}

export default GeneratedPreviewCard
