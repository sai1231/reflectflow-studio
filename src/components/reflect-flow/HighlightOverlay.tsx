
"use client";

import type React from 'react';

interface HighlightOverlayProps {
  targetElement: HTMLElement | null;
}

export function HighlightOverlay({ targetElement }: HighlightOverlayProps) {
  if (!targetElement) {
    return null;
  }

  const rect = targetElement.getBoundingClientRect();
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

  return (
    <div
      style={{
        position: 'absolute', // Use absolute positioning relative to the document
        top: `${rect.top + scrollTop}px`,
        left: `${rect.left + scrollLeft}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        border: '2px dashed red',
        pointerEvents: 'none', // Important: allows clicks to pass through
        zIndex: 9998, // High z-index but below ReflectFlowOverlay itself
        boxSizing: 'border-box',
      }}
      data-testid="highlight-overlay"
    />
  );
}
