
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

  return (
    <div
      style={{
        position: 'fixed', // Changed to fixed
        top: `${rect.top}px`, // Use rect.top directly
        left: `${rect.left}px`, // Use rect.left directly
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        border: '2px dashed hsl(var(--destructive))', // Use theme color
        pointerEvents: 'none', // Important: allows clicks to pass through
        zIndex: 9998, // High z-index but below ReflectFlowOverlay's main panel
        boxSizing: 'border-box',
        borderRadius: '2px', // Slight rounding
      }}
      data-testid="highlight-overlay"
    />
  );
}
