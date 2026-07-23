/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from 'react'

import { styles } from '../styles'
import { Agent2StreamEntry } from '../types'

type Agent2PanelProps = {
  signInUrl: string | null
  entries: Agent2StreamEntry[]
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
  entries,
  magicCode,
  onMagicCodeChange,
  onSubmitMagicCode,
  onDismissSignIn
}: Agent2PanelProps) {
  const screenshotCount = entries.reduce(
    (total, entry) => total + entry.screenshots.length,
    0
  )

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

      <details style={styles.detailsBox} open>
        <summary style={styles.detailsSummary}>
          Agent 2 run — {entries.length} {entries.length === 1 ? 'step' : 'steps'}, {screenshotCount} {screenshotCount === 1 ? 'screenshot' : 'screenshots'}
        </summary>

        <div style={styles.streamList}>
          {entries.length === 0 ? (
            <div style={styles.emptyState}>No Agent 2 activity yet. Play a saved test case to start a run.</div>
          ) : (
            entries.map(entry => (
              <div key={entry.id} style={styles.streamEntry}>
                {entry.text && (
                  <div style={styles.streamEntryText}>{entry.text}</div>
                )}

                {entry.screenshots.map(url => (
                  <img
                    key={url}
                    src={url}
                    alt='Agent 2 screenshot'
                    style={styles.screenshotImage}
                  />
                ))}

                {entry.hasScreenshotReference && entry.screenshots.length === 0 && (
                  <div style={styles.streamEntryNote}>
                    Screenshot referenced, but no image data was included in the activity.
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </details>
    </div>
  )
}

export default Agent2Panel
