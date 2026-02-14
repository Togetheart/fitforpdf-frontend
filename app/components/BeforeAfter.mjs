'use client';

import { useRef, useState, useEffect } from 'react';
import { getLayoutMode } from '../ui/responsive.mjs';

const LEFT_SNIPPET = [
  'invoice_id,client,total',
  'A102,ACME Corp,4,230.00',
  'A103,Northline,1,120.00',
  'A104,Widget,6,900.00',
].join('\n');

function clampPercent(value) {
  return Math.max(24, Math.min(76, value));
}

function getPanelStyle(isMobile) {
  return {
    padding: '14px 12px',
    minHeight: '180px',
    display: 'grid',
    gap: '10px',
    alignContent: 'start',
    color: 'rgba(0,0,0,0.85)',
  };
}

export function getBeforeAfterLayoutMode({ isMobile }) {
  return getLayoutMode({ isMobile });
}

export default function BeforeAfter({
  beforeLabel = 'CSV input',
  afterLabel = 'PDF output',
  isMobile = false,
  layoutMode,
}) {
  const [position, setPosition] = useState(48);
  const [isDragging, setIsDragging] = useState(false);
  const dragRootRef = useRef(null);
  const resolvedMode = layoutMode || getBeforeAfterLayoutMode({ isMobile });
  const isStack = resolvedMode === 'stack';

  useEffect(() => {
    if (!isDragging || isStack) return undefined;

    function computeFromX(clientX) {
      const container = dragRootRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      if (!rect.width) return;
      const percent = ((clientX - rect.left) / rect.width) * 100;
      setPosition(clampPercent(percent));
    }

    const onMouseMove = (event) => {
      computeFromX(event.clientX);
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    const onTouchMove = (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      computeFromX(touch.clientX);
    };

    const onTouchEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, isStack]);

  function startDrag(clientX) {
    if (isStack) return;
    setIsDragging(true);
    const container = dragRootRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    if (!rect.width) return;
    const percent = ((clientX - rect.left) / rect.width) * 100;
    setPosition(clampPercent(percent));
  }

  return (
    <div
      data-layout={resolvedMode}
      data-testid="before-after"
      ref={dragRootRef}
      style={{
        width: '100%',
        borderRadius: '12px',
        border: '1px solid rgba(0, 0, 0, 0.10)',
        overflow: 'hidden',
        background: '#FFFFFF',
        display: 'grid',
        gridTemplateColumns: isStack ? '1fr' : `${position}% 6px 1fr`,
        transition: 'border-color 150ms ease',
      }}
      className="beforeAfter"
      onMouseEnter={(event) => {
        const target = event.currentTarget;
        target.style.borderColor = 'rgba(0,0,0,0.2)';
      }}
      onMouseLeave={(event) => {
        const target = event.currentTarget;
        target.style.borderColor = 'rgba(0, 0, 0, 0.10)';
      }}
    >
      <style jsx>{`
        .beforeAfter:hover {
          box-shadow: 0 8px 22px rgba(0,0,0,0.05);
        }
        .divider {
          position: relative;
          cursor: col-resize;
          border: 0;
          margin: 0;
          padding: 0;
          background: rgba(0, 0, 0, 0.12);
          transition: background-color 150ms ease;
        }
        .divider:hover,
        .divider:focus-visible {
          background: rgba(0, 0, 0, 0.2);
        }
      `}</style>

      <div
        style={getPanelStyle()}
      >
        <p style={{ margin: 0, color: 'rgba(0,0,0,0.6)', fontWeight: 600 }}>
          {beforeLabel}
        </p>
        <pre
          style={{
            margin: 0,
            border: '1px dashed rgba(0,0,0,0.3)',
            borderRadius: '8px',
            padding: '8px 10px',
            fontSize: '11px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            overflow: 'auto',
            background: '#FFF',
            color: 'rgba(0,0,0,0.7)',
          }}
        >
          {LEFT_SNIPPET}
        </pre>
      </div>

      <button
        type="button"
        aria-hidden={isStack}
        data-testid="before-after-divider"
        className="divider"
        onMouseDown={(event) => startDrag(event.clientX)}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          if (touch) startDrag(touch.clientX);
        }}
        style={{
          display: isStack ? 'none' : 'block',
          borderLeft: '1px solid rgba(0, 0, 0, 0.10)',
          borderRight: '1px solid rgba(0, 0, 0, 0.10)',
        }}
      />

      <div
        style={getPanelStyle()}
      >
        <p style={{ margin: 0, color: 'rgba(0,0,0,0.6)', fontWeight: 600 }}>
          {afterLabel}
        </p>
        <div
          style={{
            border: '1px dashed rgba(0,0,0,0.3)',
            borderRadius: '8px',
            padding: '8px 10px',
            minHeight: '84px',
            display: 'grid',
            gap: '8px',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 600 }}>Client-ready structure</div>
          <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.65)' }}>Overview page</div>
          <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.65)' }}>1. Rows 1-20 • Page 1/2</div>
          <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.65)' }}>2. Columns grouped by section</div>
        </div>
      </div>
    </div>
  );
}
