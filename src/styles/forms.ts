/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from 'react'

export const formStyles: { [key: string]: React.CSSProperties } = {
  instructionBox: {
    width: '100%',
    minHeight: '145px',
    resize: 'vertical',
    boxSizing: 'border-box',
    border: '1px solid #cbd5e1',
    borderRadius: '14px',
    padding: '14px',
    fontSize: '14px',
    outline: 'none',
    background: '#f8fafc',
    color: '#0f172a'
  },
  feedbackBox: {
    width: '100%',
    minHeight: '120px',
    resize: 'vertical',
    boxSizing: 'border-box',
    border: '1px solid #cbd5e1',
    borderRadius: '14px',
    padding: '14px',
    fontSize: '14px',
    outline: 'none',
    background: '#f8fafc',
    color: '#0f172a'
  },
  csvBox: {
    width: '100%',
    minHeight: '230px',
    resize: 'vertical',
    boxSizing: 'border-box',
    border: '1px solid #cbd5e1',
    borderRadius: '14px',
    padding: '14px',
    fontSize: '13px',
    lineHeight: 1.5,
    fontFamily: 'Consolas, Monaco, monospace',
    outline: 'none',
    background: '#0f172a',
    color: '#e2e8f0'
  },
  agentInstructionBox: {
    width: '100%',
    minHeight: '260px',
    resize: 'vertical',
    boxSizing: 'border-box',
    border: '1px solid #cbd5e1',
    borderRadius: '14px',
    padding: '14px',
    fontSize: '14px',
    lineHeight: 1.6,
    outline: 'none',
    background: '#f8fafc',
    color: '#0f172a'
  },
  detailTextArea: {
    width: '100%',
    minHeight: '140px',
    resize: 'vertical',
    boxSizing: 'border-box',
    border: '1px solid #cbd5e1',
    borderRadius: '14px',
    padding: '14px',
    fontSize: '13px',
    lineHeight: 1.5,
    fontFamily: 'Consolas, Monaco, monospace',
    outline: 'none',
    background: '#ffffff',
    color: '#0f172a'
  },
  rawResponseBox: {
    marginTop: '14px',
    width: '100%',
    minHeight: '260px',
    resize: 'vertical',
    boxSizing: 'border-box',
    border: '1px solid #cbd5e1',
    borderRadius: '14px',
    padding: '14px',
    fontSize: '12px',
    lineHeight: 1.5,
    fontFamily: 'Consolas, Monaco, monospace',
    outline: 'none',
    background: '#020617',
    color: '#a7f3d0'
  },
  codeInput: {
    flex: 1,
    padding: '8px 10px',
    borderRadius: 6,
    border: '1px solid #ccc'
  }
}
