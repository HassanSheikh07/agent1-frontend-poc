/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from 'react'

import { styles } from '../styles'

type InstructionCardProps = {
  instruction: string
  canGenerate: boolean
  isLoading: boolean
  onInstructionChange: (instruction: string) => void
  onGenerate: () => void
}

function InstructionCard({
  instruction,
  canGenerate,
  isLoading,
  onInstructionChange,
  onGenerate
}: InstructionCardProps) {
  const disabled = !canGenerate || isLoading

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>User Instruction</h2>
      <p style={styles.cardDescription}>Enter the business scenario or testing request.</p>

      <textarea
        value={instruction}
        onChange={event => onInstructionChange(event.target.value)}
        style={styles.instructionBox}
        placeholder='Example: Create a customer in F&O and add demo values for all required fields'
      />

      <div style={styles.buttonRow}>
        <button
          onClick={onGenerate}
          disabled={disabled}
          style={disabled ? styles.primaryButtonDisabled : styles.primaryButton}
        >
          {isLoading ? 'Generating...' : 'Generate Output'}
        </button>
      </div>
    </div>
  )
}

export default InstructionCard
