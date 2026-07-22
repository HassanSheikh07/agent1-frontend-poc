/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from 'react'

export const statusStyles: { [key: string]: React.CSSProperties } = {
  statusCard: {
    minWidth: '310px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid #e2e8f0',
    boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
    borderRadius: '18px',
    padding: '16px'
  },
  statusDotConnected: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    background: '#22c55e',
    boxShadow: '0 0 0 6px rgba(34,197,94,0.15)'
  },
  statusDotWaiting: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    background: '#f59e0b',
    boxShadow: '0 0 0 6px rgba(245,158,11,0.15)'
  },
  statusLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: 700,
    textTransform: 'uppercase'
  },
  statusText: {
    marginTop: '4px',
    color: '#0f172a',
    fontSize: '14px',
    fontWeight: 600
  },
  outputTag: {
    padding: '7px 10px',
    borderRadius: '999px',
    background: '#dcfce7',
    color: '#166534',
    fontWeight: 800,
    fontSize: '12px'
  },
  outputTagPurple: {
    padding: '7px 10px',
    borderRadius: '999px',
    background: '#ede9fe',
    color: '#5b21b6',
    fontWeight: 800,
    fontSize: '12px'
  },
  emptyState: {
    padding: '16px',
    borderRadius: '14px',
    border: '1px dashed #cbd5e1',
    background: '#f8fafc',
    color: '#64748b',
    textAlign: 'center',
    fontSize: '14px'
  }
}
