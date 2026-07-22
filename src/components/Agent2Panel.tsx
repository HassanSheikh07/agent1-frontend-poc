/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from 'react'

import { styles } from '../styles'

type Agent2PanelProps = {
  signInUrl: string | null
  responses: string
  magicCode: string
  onMagicCodeChange: (magicCode: string) => void
  onSubmitMagicCode: () => void
  onDismissSignIn: () => void
}

/**
 * Agent 2 normally signs in silently through the token exchange in
 * auth/agent2TokenExchange.ts. The sign-in URL and validation code only appear
 * when that exchange is unavailable and the manual gate takes over.
 */
function Agent2Panel({
  signInUrl,
  responses,
  magicCode,
  onMagicCodeChange,
  onSubmitMagicCode,
  onDismissSignIn
}: Agent2PanelProps) {
  return (
    <div style={styles.outputCard}>
      <div style={styles.outputHeader}>
        <div>
          <h2 style={styles.cardTitle}>Agent 2 (CUA)</h2>
          <p style={styles.cardDescription}>Sign in if prompted, then watch Agent 2 respond.</p>
        </div>
      </div>

      {signInUrl && (
        <div style={styles.signInSection}>
          <div style={styles.buttonRow}>
            <button
              onClick={() => { window.open(signInUrl, 'agent2-signin', 'width=520,height=680') }}
              style={styles.successButton}
            >
              Sign in to Agent 2
            </button>
            <button onClick={onDismissSignIn} style={styles.cancelButton}>
              Dismiss
            </button>
          </div>
          <div style={styles.signInCodeSection}>
            <div style={styles.previewLabel}>Validation code (from the sign-in popup)</div>
            <div style={styles.buttonRow}>
              <input
                value={magicCode}
                onChange={event => onMagicCodeChange(event.target.value)}
                placeholder='e.g. 954858'
                style={styles.codeInput}
              />
              <button onClick={onSubmitMagicCode} style={styles.successButton}>
                Submit code
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.previewLabel}>Agent 2 responses</div>
      <textarea value={responses} readOnly style={styles.rawResponseBox} />
    </div>
  )
}

export default Agent2Panel
