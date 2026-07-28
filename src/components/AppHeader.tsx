/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useEffect, useState } from 'react'
import { styles } from '../styles'
import ProductTheme from './ProductTheme'

type AppHeaderProps = {
  status: string
  isConnected: boolean
  isBusy: boolean
  activeStage: 1 | 2 | 3
}

type WorkflowStage = {
  stage: AppHeaderProps['activeStage']
  label: string
  value: string
}

const WORKFLOW_STAGES: readonly WorkflowStage[] = [
  { stage: 1, label: 'Stage 01', value: 'Scenario authoring' },
  { stage: 2, label: 'Stage 02', value: 'Review and approval' },
  { stage: 3, label: 'Stage 03', value: 'CUA execution evidence' }
] as const

const cx = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(' ')

function AppHeader({
  status,
  isConnected,
  isBusy,
  activeStage
}: AppHeaderProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    let ticking = false

    function handleScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsCollapsed(window.scrollY > 120)
          ticking = false
        })
        ticking = true
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])


  const statusDotClass = isConnected
    ? 'relay-status-dot relay-status-dot--connected'
    : 'relay-status-dot relay-status-dot--waiting'

  return (
    <>
      <ProductTheme />

      <header className="relay-masthead" style={styles.header}>
        <div style={{ minWidth: 0, flex: 1 }}>
          {/* Brand Header Lockup */}
          <div className="relay-brand-lockup">
            <div className="relay-brand-mark" aria-hidden="true" />
            <div>
              <div style={styles.badge}>Agent Relay Workbench</div>
              <h1 style={styles.title}>Test operations control room</h1>
            </div>
          </div>

          <p style={styles.subtitle}>
            Author the scenario with Agent 1, inspect the handoff package, then
            run the approved script through Agent 2 and preserve its Computer
            Use evidence.
          </p>


          <nav className="relay-phase-strip" aria-label="Workflow stages">
            {WORKFLOW_STAGES.map(({ stage, label, value }) => {
              const isActive = stage === activeStage
              return (
                <div
                  key={stage}
                  className={cx('relay-phase', isActive && 'relay-phase--active')}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <div className="relay-phase__label">
                    {isActive && (
                      <span
                        className="relay-phase__dot"
                        aria-hidden="true"
                      />
                    )}
                    {label}
                  </div>
                  <div className="relay-phase__value">{value}</div>
                </div>
              )
            })}
          </nav>
        </div>
        <div
          className={cx(
            'relay-connection-card',
            isCollapsed && 'relay-connection-card--collapsed'
          )}
          style={styles.statusCard}
        >
          {isBusy ? (
            <span
              className="relay-spinner"
              title="A response is being generated"
              aria-hidden="true"
            />
          ) : (
            <span className={statusDotClass} aria-hidden="true" />
          )}

          <div>
            {!isCollapsed && (
              <div style={styles.statusLabel}>Agent 1 channel</div>
            )}

            <div
              className="relay-connection-status"
              style={styles.statusText}
            >
              {status}
            </div>

            {!isCollapsed && (
              <div className="relay-connection-meta">
                {isConnected
                  ? 'Authenticated · Ready for authoring'
                  : 'Establishing authenticated session'}
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  )
}

export default AppHeader