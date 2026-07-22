/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from 'react'

import { styles } from '../styles'
import { SavedTestCase } from '../types'
import SavedTestCaseRow from './SavedTestCaseRow'
import SavedTestCaseDetails from './SavedTestCaseDetails'

type SavedTestCasesCardProps = {
  testCases: SavedTestCase[]
  selectedTestCase: SavedTestCase | null
  playingTestCaseId: number | null
  onSelect: (testCase: SavedTestCase) => void
  onClearSelection: () => void
  onPlay: (testCase: SavedTestCase) => void
}

function SavedTestCasesCard({
  testCases,
  selectedTestCase,
  playingTestCaseId,
  onSelect,
  onClearSelection,
  onPlay
}: SavedTestCasesCardProps) {
  return (
    <div style={styles.outputCard}>
      <div style={styles.outputHeader}>
        <div>
          <h2 style={styles.cardTitle}>Saved Test Cases</h2>
          <p style={styles.cardDescription}>Each approved save creates a row you can run later.</p>
        </div>
        <span style={styles.outputTag}>Runs</span>
      </div>

      <div style={styles.savedList}>
        {testCases.length === 0 ? (
          <div style={styles.emptyState}>No saved test cases yet. Approve &amp; Save to create one.</div>
        ) : (
          testCases.map(testCase => (
            <SavedTestCaseRow
              key={testCase.id}
              testCase={testCase}
              isPlaying={playingTestCaseId === testCase.id}
              onSelect={onSelect}
              onPlay={onPlay}
            />
          ))
        )}
      </div>

      {selectedTestCase && (
        <SavedTestCaseDetails
          testCase={selectedTestCase}
          onClose={onClearSelection}
        />
      )}
    </div>
  )
}

export default SavedTestCasesCard
