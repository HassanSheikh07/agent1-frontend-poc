/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from 'react'

import { styles } from '../styles'

type FeedbackCardProps = {
  feedback: string
  canRevise: boolean
  isLoading: boolean
  onFeedbackChange: (feedback: string) => void
  onSendChanges: () => void
}

function FeedbackCard({
  feedback,
  canRevise,
  isLoading,
  onFeedbackChange,
  onSendChanges
}: FeedbackCardProps) {
  const disabled = !canRevise || isLoading

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>Feedback / Change Request</h2>
      <p style={styles.cardDescription}>Use this if the generated output needs revision before saving.</p>

      <textarea
        value={feedback}
        onChange={event => onFeedbackChange(event.target.value)}
        style={styles.feedbackBox}
        placeholder='Example: Create only one test case row and use placeholders for missing required values.'
      />

      <button
        onClick={onSendChanges}
        disabled={disabled}
        style={disabled ? styles.secondaryButtonDisabled : styles.secondaryButton}
      >
        Send Changes
      </button>
    </div>
  )
}

export default FeedbackCard
