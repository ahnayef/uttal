'use client';
import { useState, useEffect } from 'react';

export default function LiveCountdown({ deadline }: { deadline: string }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    // If deadline has no time component, append 23:59:59
    let targetDateStr = deadline;
    if (targetDateStr.length === 10) {
      targetDateStr += 'T23:59:59';
    }

    const target = new Date(targetDateStr).getTime();

    const update = () => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setIsOverdue(true);
        setTimeLeft('Overdue');
        return;
      }

      setIsOverdue(false);
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      const parts = [];
      if (d > 0) parts.push(`${d}d`);
      if (h > 0 || d > 0) parts.push(`${h}h`);
      if (m > 0 || h > 0 || d > 0) parts.push(`${m}m`);
      parts.push(`${s}s`);

      setTimeLeft(parts.join(' '));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (!timeLeft) return null;

  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '11px',
        fontWeight: '600',
        padding: '2px 8px',
        borderRadius: '6px',
        background: isOverdue ? 'rgba(239,68,68,0.1)' : 'var(--bg-surface-elevated)',
        color: isOverdue ? '#ef4444' : 'var(--text-tertiary)',
        border: `1px solid ${isOverdue ? 'rgba(239,68,68,0.3)' : 'var(--border-subtle)'}`,
        fontFamily: 'var(--font-inter), monospace',
        letterSpacing: '0.02em',
      }}
    >
      {timeLeft}
    </span>
  );
}
