/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from 'react'

export const layoutStyles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: '100vh',
    width: '100vw',
    boxSizing: 'border-box',
    background: 'linear-gradient(135deg, #eef4ff 0%, #f8fafc 45%, #eefdf8 100%)',
    padding: '28px',
    fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
    color: '#0f172a',
    overflowY: 'auto'
  },
  header: {
    maxWidth: '1400px',
    margin: '0 auto 24px auto',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '24px',
    alignItems: 'center'
  },
  badge: {
    display: 'inline-block',
    padding: '7px 12px',
    borderRadius: '999px',
    background: '#dbeafe',
    color: '#1d4ed8',
    fontWeight: 700,
    fontSize: '12px',
    letterSpacing: '0.4px',
    textTransform: 'uppercase'
  },
  title: {
    margin: '14px 0 8px 0',
    fontSize: '34px',
    lineHeight: 1.1,
    fontWeight: 800,
    color: '#0f172a'
  },
  subtitle: {
    margin: 0,
    fontSize: '15px',
    color: '#475569',
    maxWidth: '720px'
  },
  grid: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '420px 1fr',
    gap: '24px'
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  buttonRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '14px',
    flexWrap: 'wrap'
  },
  outputHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    alignItems: 'flex-start'
  },
  signInSection: {
    marginBottom: 16
  },
  signInCodeSection: {
    marginTop: 12
  }
}
