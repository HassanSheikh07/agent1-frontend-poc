/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from 'react'

import { styles } from '../styles'
import { SavedTestCase } from '../types'

type SavedTestCaseRowProps = {
  testCase: SavedTestCase
  isPlaying: boolean
  onSelect: (testCase: SavedTestCase) => void
  onPlay: (testCase: SavedTestCase) => void
}

function SavedTestCaseRow({ testCase, isPlaying, onSelect, onPlay }: SavedTestCaseRowProps) {
  return (
    <div
      style={styles.savedRow}
      onClick={() => onSelect(testCase)}
      role='button'
      tabIndex={0}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(testCase)
        }
      }}
    >
      <div style={styles.savedRowName}>{testCase.name}</div>
      <button
        onClick={event => {
          event.stopPropagation()
          onPlay(testCase)
        }}
        style={isPlaying ? styles.playButtonLoading : styles.playButton}
        disabled={isPlaying}
        type='button'
      >
        {isPlaying ? '⏳' : '▶'}
      </button>
    </div>
  )
}

export default SavedTestCaseRow
