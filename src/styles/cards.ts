/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from 'react'

export const cardStyles: { [key: string]: React.CSSProperties } = {
  card: {
    background: 'rgba(255,255,255,0.96)',
    borderRadius: '20px',
    padding: '22px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 18px 45px rgba(15,23,42,0.08)'
  },
  outputCard: {
    background: 'rgba(255,255,255,0.98)',
    borderRadius: '20px',
    padding: '22px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 18px 45px rgba(15,23,42,0.08)'
  },
  consentCard: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '22px',
    border: '2px solid #bfdbfe',
    boxShadow: '0 18px 45px rgba(37,99,235,0.16)'
  },
  consentIcon: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: '#dbeafe',
    color: '#1d4ed8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    marginBottom: '12px'
  },
  consentTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 900,
    color: '#0f172a'
  },
  consentDescription: {
    margin: '8px 0 0 0',
    fontSize: '14px',
    color: '#475569',
    lineHeight: 1.5
  },
  permissionBox: {
    marginTop: '14px',
    background: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '14px',
    padding: '12px'
  },
  permissionLabel: {
    fontSize: '12px',
    fontWeight: 800,
    color: '#475569',
    textTransform: 'uppercase',
    marginBottom: '6px'
  },
  permissionText: {
    fontSize: '13px',
    color: '#0f172a',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap'
  },
  cardTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 800,
    color: '#0f172a'
  },
  cardDescription: {
    margin: '6px 0 14px 0',
    fontSize: '13px',
    color: '#64748b',
    lineHeight: 1.5
  },
  savedList: {
    marginTop: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  savedRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    cursor: 'pointer'
  },
  savedRowName: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#0f172a',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  previewSection: {
    marginTop: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  previewLabel: {
    fontSize: '12px',
    fontWeight: 800,
    color: '#64748b',
    textTransform: 'uppercase'
  },
  detailCard: {
    marginTop: '14px',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '14px',
    background: '#f8fafc'
  },
  detailValue: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#0f172a',
    whiteSpace: 'pre-wrap',
    marginBottom: '12px'
  },
  detailsBox: {
    background: 'rgba(255,255,255,0.90)',
    borderRadius: '18px',
    border: '1px solid #e2e8f0',
    padding: '16px',
    boxShadow: '0 10px 30px rgba(15,23,42,0.06)'
  },
  detailsSummary: {
    cursor: 'pointer',
    fontWeight: 800,
    color: '#334155'
  },
  streamList: {
    marginTop: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    maxHeight: '540px',
    overflowY: 'auto'
  },
  streamEntry: {
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '14px',
    background: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  streamEntryText: {
    fontSize: '14px',
    color: '#0f172a',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap'
  },
  streamEntryNote: {
    fontSize: '12px',
    color: '#b45309',
    fontWeight: 600
  },
  screenshotImage: {
    maxWidth: '100%',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    background: '#ffffff'
  }
}
