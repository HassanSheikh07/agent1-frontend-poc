/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from 'react'

import { styles } from '../styles'

type AppHeaderProps = {
  status: string
  isConnected: boolean
}

function AppHeader({ status, isConnected }: AppHeaderProps) {
  return (
    <div style={styles.header}>
      <div>
        <div style={styles.badge}>Computer Use Automation POC</div>
        <h1 style={styles.title}>Agent 1 Test Script Generator</h1>
        <p style={styles.subtitle}>
          Generate CSV test case data, review the Agent 2 execution instruction, revise if needed, and save only after approval.
        </p>
      </div>

      <div style={styles.statusCard}>
        <span style={isConnected ? styles.statusDotConnected : styles.statusDotWaiting}></span>
        <div>
          <div style={styles.statusLabel}>Connection Status</div>
          <div style={styles.statusText}>{status}</div>
        </div>
      </div>
    </div>
  )
}

export default AppHeader
