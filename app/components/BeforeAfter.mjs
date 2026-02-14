'use client';

import { useEffect, useRef, useState } from 'react';

function clampPercent(value) {
  return Math.max(20, Math.min(80, value));
}

export default function BeforeAfter({ beforeLabel = 'CSV INPUT', afterLabel = 'PDF OUTPUT' }) {
  const containerRef = useRef(null);
  const [position, setPosition] = useState(52);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 780px)');
    const updateMobile = () => setIsMobile(mediaQuery.matches);
    updateMobile();
    mediaQuery.addEventListener('change', updateMobile);
    return () => mediaQuery.removeEventListener('change', updateMobile);
  }, []);

  useEffect(() => {
    if (!isDragging) return undefined;

    function computeFromX(clientX) {
      const container = containerRef.current;
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
  }, [isDragging]);

  function startDragWithX(clientX) {
    if (isMobile) return;
    setIsDragging(true);
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    if (!rect.width) return;
    const percent = ((clientX - rect.left) / rect.width) * 100;
    setPosition(clampPercent(percent));
  }

  return (
    <div className="before-after" ref={containerRef}>
      <style jsx>{`
        .before-after {
          width: 100%;
          min-height: 260px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 14px;
          overflow: hidden;
          display: grid;
          position: relative;
          grid-template-columns: ${`${position}% 6px auto`};
          background: #fff;
        }
        .panel {
          padding: 0.85rem;
          min-height: 260px;
          display: grid;
          align-content: start;
          gap: 0.7rem;
          border-right: 1px solid rgba(0, 0, 0, 0.08);
          background: #fff;
        }
        .panel:last-child {
          border-right: 0;
        }
        .placeholder {
          min-height: 175px;
          border-radius: 10px;
          border: 1px dashed rgba(0, 0, 0, 0.22);
          background: linear-gradient(180deg, #f8fafc, #ffffff);
          display: grid;
          place-items: center;
          color: rgba(0, 0, 0, 0.56);
          font-size: 0.84rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .label {
          font-size: 0.86rem;
          color: rgba(0, 0, 0, 0.65);
          font-weight: 600;
        }
        .label span {
          color: #111827;
          font-weight: 700;
        }
        .divider {
          cursor: col-resize;
          background: rgba(0, 0, 0, 0.08);
          position: relative;
          display: grid;
          place-items: center;
        }
        .dividerGrip {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.25);
          background: #fff;
          color: rgba(0, 0, 0, 0.58);
          display: grid;
          place-items: center;
          font-size: 0.75rem;
        }
        .dividerGrip::before,
        .dividerGrip::after {
          content: '';
          position: absolute;
          height: 1px;
          width: 16px;
          background: rgba(0, 0, 0, 0.55);
          transform: translate(-50%, -50%);
        }
        .dividerGrip::before {
          transform: rotate(90deg);
          left: 50%;
          top: 50%;
        }
        .dividerGrip::after {
          left: 50%;
          top: 50%;
        }

        @media (max-width: 780px) {
          .before-after {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto;
            min-height: unset;
          }
          .panel {
            border-right: 0;
          }
          .divider {
            display: none;
          }
          .placeholder {
            min-height: 120px;
          }
        }
      `}</style>

      <section className="panel">
        <p className="label"><span>{beforeLabel}</span></p>
        <div className="placeholder">Before</div>
        <div className="placeholder">Rows, columns, raw sheet structure</div>
      </section>

      <button
        type="button"
        className="divider"
        onMouseDown={(event) => startDragWithX(event.clientX)}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          if (touch) startDragWithX(touch.clientX);
        }}
        aria-label="Move divider"
        style={{ display: isMobile ? 'none' : 'grid' }}
      >
        <span className="dividerGrip" />
      </button>

      <section className="panel">
        <p className="label"><span>{afterLabel}</span></p>
        <div className="placeholder">After</div>
        <div className="placeholder">Paged view with headers and spacing</div>
      </section>
    </div>
  );
}
