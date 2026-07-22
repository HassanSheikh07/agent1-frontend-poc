/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from 'react'

import { styles } from '../styles'

type RawResponsePanelProps = {
  fullResponse: string
}

function RawResponsePanel({ fullResponse }: RawResponsePanelProps) {
  return (
    <details style={styles.detailsBox}>
      <summary style={styles.detailsSummary}>View full raw Agent 1 response</summary>
      <textarea
        value={fullResponse}
        readOnly
        style={styles.rawResponseBox}
      />
    </details>
  )
}

export default RawResponsePanel
