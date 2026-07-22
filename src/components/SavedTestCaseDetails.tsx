/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from 'react'

import { styles } from '../styles'
import { SavedTestCase } from '../types'

type SavedTestCaseDetailsProps = {
  testCase: SavedTestCase
  onClose: () => void
}

function SavedTestCaseDetails({ testCase, onClose }: SavedTestCaseDetailsProps) {
  return (
    <div style={styles.detailCard}>
      <div style={styles.outputHeader}>
        <div>
          <h2 style={styles.cardTitle}>Selected Saved Case</h2>
          <p style={styles.cardDescription}>{testCase.name}</p>
        </div>
        <button
          type='button'
          onClick={onClose}
          style={styles.closeButton}
        >
          ✕
        </button>
      </div>

      <div style={styles.previewLabel}>Name</div>
      <div style={styles.detailValue}>{testCase.name}</div>

      <div style={styles.previewLabel}>CSV Preview</div>
      <textarea
        value={testCase.csvContent}
        readOnly
        style={styles.detailTextArea}
      />

      <div style={styles.previewLabel}>Agent 2 Instruction</div>
      <textarea
        value={testCase.instruction}
        readOnly
        style={styles.detailTextArea}
      />
    </div>
  )
}

export default SavedTestCaseDetails
