/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from 'react'

import { styles } from '../styles'
import { ConsentCardInfo } from '../types'

type ConnectorConsentCardProps = {
  consentCard: ConsentCardInfo
  isLoading: boolean
  onRespond: (action: 'Allow' | 'Cancel') => void
}

function ConnectorConsentCard({ consentCard, isLoading, onRespond }: ConnectorConsentCardProps) {
  return (
    <div style={styles.consentCard}>
      <div style={styles.consentIcon}>!</div>
      <h2 style={styles.consentTitle}>{consentCard.title}</h2>
      <p style={styles.consentDescription}>
        Agent 1 needs permission to use <strong>{consentCard.connectorName}</strong> before it can continue the save step.
      </p>
      <p style={styles.consentDescription}>{consentCard.description}</p>

      <div style={styles.permissionBox}>
        <div style={styles.permissionLabel}>Permission request</div>
        <div style={styles.permissionText}>{consentCard.permissions}</div>
      </div>

      <div style={styles.buttonRow}>
        <button
          onClick={() => onRespond('Allow')}
          disabled={isLoading}
          style={isLoading ? styles.successButtonDisabled : styles.successButton}
        >
          Allow
        </button>

        <button
          onClick={() => onRespond('Cancel')}
          disabled={isLoading}
          style={isLoading ? styles.secondaryButtonDisabled : styles.cancelButton}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default ConnectorConsentCard
