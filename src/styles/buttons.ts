/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from 'react'

export const buttonStyles: { [key: string]: React.CSSProperties } = {
  primaryButton: {
    border: 'none',
    borderRadius: '12px',
    padding: '12px 18px',
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: '#ffffff',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(37,99,235,0.25)'
  },
  primaryButtonDisabled: {
    border: 'none',
    borderRadius: '12px',
    padding: '12px 18px',
    background: '#94a3b8',
    color: '#ffffff',
    fontWeight: 800,
    cursor: 'not-allowed'
  },
  successButton: {
    border: 'none',
    borderRadius: '12px',
    padding: '12px 18px',
    background: 'linear-gradient(135deg, #16a34a, #15803d)',
    color: '#ffffff',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(22,163,74,0.25)'
  },
  successButtonDisabled: {
    border: 'none',
    borderRadius: '12px',
    padding: '12px 18px',
    background: '#94a3b8',
    color: '#ffffff',
    fontWeight: 800,
    cursor: 'not-allowed'
  },
  secondaryButton: {
    border: 'none',
    borderRadius: '12px',
    padding: '12px 18px',
    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    color: '#ffffff',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(124,58,237,0.25)'
  },
  secondaryButtonDisabled: {
    border: 'none',
    borderRadius: '12px',
    padding: '12px 18px',
    background: '#94a3b8',
    color: '#ffffff',
    fontWeight: 800,
    cursor: 'not-allowed'
  },
  cancelButton: {
    border: 'none',
    borderRadius: '12px',
    padding: '12px 18px',
    background: '#64748b',
    color: '#ffffff',
    fontWeight: 800,
    cursor: 'pointer'
  },
  playButton: {
    border: 'none',
    borderRadius: '999px',
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 900,
    cursor: 'pointer',
    boxShadow: '0 8px 16px rgba(37,99,235,0.24)'
  },
  playButtonLoading: {
    border: 'none',
    borderRadius: '999px',
    width: '40px',
    height: '40px',
    background: '#94a3b8', // Gray background for loading state
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 900,
    cursor: 'not-allowed',
    boxShadow: 'none'
  },
  closeButton: {
    border: 'none',
    borderRadius: '999px',
    width: '34px',
    height: '34px',
    background: '#e2e8f0',
    color: '#334155',
    fontSize: '16px',
    fontWeight: 800,
    cursor: 'pointer'
  }
}
