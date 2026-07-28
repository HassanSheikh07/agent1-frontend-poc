/**
 * Presentation-only product theme for the Agent Relay workbench.
 * No agent, authentication, Direct Line or stream behavior lives here.
 */

import React from 'react'

function ProductTheme() {
  return (
    <style>{`
      :root {
        --relay-ink: #17212f;
        --relay-ink-soft: #334155;
        --relay-paper: #f2efe9;
        --relay-surface: #fffdf9;
        --relay-line: #d8d2c8;
        --relay-muted: #6f7886;
        --relay-copper: #c05e32;
        --relay-copper-soft: #f7e2d8;
        --relay-teal: #0b7f82;
        --relay-teal-soft: #e4f4f2;
        --relay-green: #2d7a58;
        --relay-amber: #b57a22;
        --relay-danger: #b23f3f;
        --relay-shadow: 0 18px 50px rgba(35, 42, 52, .10);
      }

      * {
        box-sizing: border-box;
      }

      html {
        scroll-behavior: smooth;
      }

      body {
        margin: 0;
        background: var(--relay-paper);
      }

      button,
      textarea,
      input {
        font: inherit;
      }

      button:focus-visible,
      textarea:focus-visible,
      input:focus-visible,
      summary:focus-visible {
        outline: 3px solid rgba(11, 127, 130, .24);
        outline-offset: 2px;
      }

      .relay-card {
        position: relative;
        overflow: hidden;
        transition:
          transform 180ms ease,
          border-color 180ms ease,
          box-shadow 180ms ease;
      }

      .relay-card:hover {
        transform: translateY(-2px);
        border-color: #c7beb2 !important;
        box-shadow: 0 24px 56px rgba(37, 45, 56, .13) !important;
      }

      .relay-card::after {
        content: "";
        position: absolute;
        inset: 0 auto auto 0;
        width: 100%;
        height: 3px;
        background: var(--relay-accent, var(--relay-copper));
      }

      .relay-card--teal {
        --relay-accent: var(--relay-teal);
      }

      .relay-card--green {
        --relay-accent: var(--relay-green);
      }

      .relay-card--amber {
        --relay-accent: var(--relay-amber);
      }

      .relay-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: var(--relay-muted);
        font-family: Consolas, Monaco, monospace;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: .12em;
        text-transform: uppercase;
      }

      .relay-eyebrow::before {
        content: "";
        width: 18px;
        height: 2px;
        background: var(--relay-accent, var(--relay-copper));
      }

      .relay-card-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 18px;
      }

      .relay-step-mark {
        flex: 0 0 auto;
        min-width: 48px;
        padding: 7px 8px;
        border: 1px solid var(--relay-line);
        border-radius: 9px;
        background: #f7f4ef;
        color: #7c746b;
        font-family: Consolas, Monaco, monospace;
        font-size: 11px;
        font-weight: 900;
        text-align: center;
      }

      .relay-field-label {
        display: block;
        margin: 0 0 8px;
        color: #4a5566;
        font-size: 12px;
        font-weight: 800;
      }

      .relay-action-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        margin-top: 16px;
        flex-wrap: wrap;
      }

      .relay-action-note {
        color: #7a8290;
        font-size: 12px;
        line-height: 1.5;
      }

      .relay-button {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        min-height: 42px;
        border-radius: 10px;
        transition:
          transform 160ms ease,
          box-shadow 160ms ease,
          background 160ms ease,
          border-color 160ms ease;
      }

      .relay-button:hover:not(:disabled) {
        transform: translateY(-1px);
      }

      .relay-button:active:not(:disabled) {
        transform: translateY(0);
      }

      .relay-button__icon {
        font-family: Consolas, Monaco, monospace;
        font-size: 13px;
      }

      .relay-preview-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.06fr) minmax(0, .94fr);
        gap: 16px;
      }

      .relay-preview-pane {
        min-width: 0;
      }

      .relay-preview-pane__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 8px;
      }

      .relay-preview-pane__badge {
        padding: 4px 7px;
        border: 1px solid #d8d2c8;
        border-radius: 7px;
        background: #f7f4ef;
        color: #7b746c;
        font-family: Consolas, Monaco, monospace;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: .08em;
        text-transform: uppercase;
      }

      .relay-run-row {
        position: relative;
        transition:
          transform 160ms ease,
          border-color 160ms ease,
          background 160ms ease;
      }

      .relay-run-row:hover {
        transform: translateX(3px);
        border-color: #aebdc1 !important;
        background: #f1f7f6 !important;
      }

      .relay-run-row::before {
        content: "";
        position: absolute;
        inset: 10px auto 10px 0;
        width: 3px;
        border-radius: 999px;
        background: var(--relay-teal);
      }

      .relay-run-name-wrap {
        display: flex;
        min-width: 0;
        align-items: center;
        gap: 11px;
      }

      .relay-run-index {
        display: grid;
        place-items: center;
        width: 34px;
        height: 34px;
        flex: 0 0 34px;
        border: 1px solid #c9d8d8;
        border-radius: 9px;
        background: #e8f4f3;
        color: var(--relay-teal);
        font-family: Consolas, Monaco, monospace;
        font-size: 10px;
        font-weight: 900;
      }

      .relay-details-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 12px;
      }

      .relay-consent-actions {
        display: flex;
        gap: 10px;
        margin-top: 16px;
        flex-wrap: wrap;
      }

      .relay-raw-console {
        margin-top: 14px;
        overflow: hidden;
        border: 1px solid #263649;
        border-radius: 12px;
        background: #0d1724;
      }

      .relay-raw-console__bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 9px 12px;
        border-bottom: 1px solid #263649;
        color: #a7b5c4;
        font-family: Consolas, Monaco, monospace;
        font-size: 10px;
        letter-spacing: .06em;
        text-transform: uppercase;
      }

      .relay-raw-console__lights {
        display: flex;
        gap: 5px;
      }

      .relay-raw-console__lights span {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #607184;
      }

      .relay-raw-console__lights span:nth-child(1) {
        background: #d46c52;
      }

      .relay-raw-console__lights span:nth-child(2) {
        background: #d5a34d;
      }

      .relay-raw-console__lights span:nth-child(3) {
        background: #46a37a;
      }

      .relay-masthead {
        position: relative;
        overflow: hidden;
      }

      .relay-masthead::before {
        content: "";
        position: absolute;
        inset: 0 0 auto 0;
        height: 5px;
        background:
          repeating-linear-gradient(
            90deg,
            var(--relay-copper) 0 72px,
            transparent 72px 82px,
            var(--relay-teal) 82px 154px,
            transparent 154px 164px
          );
      }

      .relay-brand-lockup {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .relay-brand-mark {
        position: relative;
        width: 44px;
        height: 44px;
        flex: 0 0 44px;
        border: 1px solid #223248;
        border-radius: 12px;
        background: #182333;
      }

      .relay-brand-mark::before,
      .relay-brand-mark::after {
        content: "";
        position: absolute;
      }

      .relay-brand-mark::before {
        inset: 10px;
        border: 2px solid #d7e7e5;
        border-radius: 5px 12px 5px 12px;
      }

      .relay-brand-mark::after {
        width: 10px;
        height: 10px;
        top: 17px;
        left: 17px;
        border-radius: 50%;
        background: var(--relay-copper);
      }

      .relay-phase-strip {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
        margin-top: 18px;
      }

      .relay-phase {
        position: relative;
        padding: 11px 12px 10px;
        border: 1px solid #d8d2c8;
        border-radius: 10px;
        background: #f8f5f0;
      }

      .relay-phase::after {
        content: "";
        position: absolute;
        inset: auto 10px 0 10px;
        height: 2px;
        background: var(--phase-color, var(--relay-copper));
      }

      .relay-phase:nth-child(2) {
        --phase-color: #8a7865;
      }

      .relay-phase:nth-child(3) {
        --phase-color: var(--relay-teal);
      }

      .relay-phase--active {
        border-color: var(--phase-color, var(--relay-copper));
        background: #fdf9f2;
        box-shadow: 0 6px 16px rgba(45, 52, 64, .07);
      }

      .relay-phase--active::after {
        height: 3px;
      }

      .relay-phase__dot {
        display: inline-block;
        width: 7px;
        height: 7px;
        margin-right: 6px;
        border-radius: 50%;
        background: var(--phase-color, var(--relay-copper));
        vertical-align: middle;
        animation: relay-phase-pulse 1.6s ease-out infinite;
      }

      @keyframes relay-phase-pulse {
        0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--phase-color, var(--relay-copper)) 35%, transparent); }
        70% { box-shadow: 0 0 0 6px transparent; }
        100% { box-shadow: 0 0 0 0 transparent; }
      }

      .relay-phase__label {
        color: #7b746c;
        font-family: Consolas, Monaco, monospace;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: .08em;
        text-transform: uppercase;
      }

      .relay-phase__value {
        margin-top: 5px;
        color: #2f3948;
        font-size: 12px;
        font-weight: 800;
      }

      .relay-connection-card {
        position: relative;
        overflow: hidden;
      }

      .relay-connection-card::after {
        content: "";
        position: absolute;
        inset: auto 0 0 0;
        height: 3px;
        background: var(--relay-teal);
      }

      .relay-connection-meta {
        margin-top: 6px;
        color: #7b8796;
        font-family: Consolas, Monaco, monospace;
        font-size: 10px;
      }

      .relay-connection-card--collapsed {
        position: fixed;
        top: 14px;
        right: 18px;
        z-index: 60;
        min-width: 0 !important;
        padding: 10px 14px !important;
        box-shadow: 0 14px 34px rgba(35, 42, 52, .18);
      }

      .relay-connection-card--collapsed .relay-connection-status {
        margin-top: 0 !important;
      }

      .relay-status-dot {
        width: 10px;
        height: 10px;
        flex: 0 0 10px;
        border-radius: 50%;
      }

      .relay-status-dot--connected {
        background: #2d9c72;
        box-shadow: 0 0 0 5px rgba(45, 156, 114, .12);
      }

      .relay-status-dot--waiting {
        background: #c28a2c;
        box-shadow: 0 0 0 5px rgba(194, 138, 44, .12);
      }

      .relay-spinner {
        width: 14px;
        height: 14px;
        flex: 0 0 14px;
        border-radius: 50%;
        border: 2px solid rgba(120, 112, 102, .30);
        border-top-color: currentColor;
        animation: relay-spin .7s linear infinite;
      }

      @keyframes relay-spin {
        to {
          transform: rotate(360deg);
        }
      }

      @media (max-width: 980px) {
        .relay-preview-grid,
        .relay-details-grid {
          grid-template-columns: 1fr;
        }

        .relay-phase-strip {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 720px) {
        .relay-card-head,
        .relay-action-row {
          flex-direction: column;
          align-items: stretch;
        }

        .relay-step-mark {
          align-self: flex-start;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          scroll-behavior: auto !important;
          animation-duration: .001ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: .001ms !important;
        }
      }
    `}</style>
  )
}

export default ProductTheme
