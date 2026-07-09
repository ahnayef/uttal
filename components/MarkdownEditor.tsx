'use client';
import { useState, useRef, useEffect } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { LuBold, LuItalic, LuHeading2, LuList, LuCode, LuQuote } from 'react-icons/lu';

interface Props { initialValue: string; onChange: (val: string) => void; minHeight?: number; }

const TOOLBAR = [
  { icon: <LuBold size={14} />, title: 'Bold',   insert: '**bold**' },
  { icon: <LuItalic size={14} />, title: 'Italic', insert: '*italic*' },
  { icon: <LuHeading2 size={14} />, title: 'Heading', insert: '\n## '  },
  { icon: <LuList size={14} />, title: 'List',   insert: '\n- '    },
  { icon: <LuCode size={14} />, title: 'Code',   insert: '`code`'  },
  { icon: <LuQuote size={14} />, title: 'Quote',  insert: '\n> '    },
];

export default function MarkdownEditor({ initialValue, onChange, minHeight = 200 }: Props) {
  const [view, setView] = useState<'write' | 'preview'>('write');
  const [draftValue, setDraftValue] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const updateTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (view !== 'write') return;
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, minHeight)}px`;
    }
  }, [draftValue, view, minHeight]);

  const queueChange = (nextValue: string) => {
    setDraftValue(nextValue);

    if (updateTimerRef.current) {
      window.clearTimeout(updateTimerRef.current);
    }

    updateTimerRef.current = window.setTimeout(() => {
      onChange(nextValue);
    }, 350);
  };

  const flushChange = (nextValue: string) => {
    if (updateTimerRef.current) {
      window.clearTimeout(updateTimerRef.current);
    }
    onChange(nextValue);
  };

  useEffect(() => {
    return () => {
      if (updateTimerRef.current) {
        window.clearTimeout(updateTimerRef.current);
      }
    };
  }, []);

  return (
    <div style={{
      background: 'var(--bg-main)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 16px', background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-surface-elevated)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          {(['write', 'preview'] as const).map(v => (
            <button key={v} type="button" onClick={() => setView(v)} style={{
              padding: '4px 14px', borderRadius: '6px', border: 'none',
              background: view === v ? 'var(--bg-surface-hover)' : 'transparent',
              color: view === v ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '12px', fontWeight: view === v ? '600' : '500',
              cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s',
            }}>
              {v}
            </button>
          ))}
        </div>
        
        <div style={{ width: '1px', height: '16px', background: 'var(--border-strong)', margin: '0 8px' }} />
        
        {TOOLBAR.map((btn, idx) => (
          <button
            key={idx} type="button" title={btn.title}
            onClick={() => flushChange(draftValue + btn.insert)}
            style={{
              width: '28px', height: '28px', borderRadius: '6px',
              border: 'none', background: 'transparent',
              color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface-hover)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
            }}
          >
            {btn.icon}
          </button>
        ))}
      </div>

      {/* Content */}
      {view === 'write' ? (
        <textarea
          ref={textareaRef}
          value={draftValue}
          onChange={e => queueChange(e.target.value)}
          placeholder="Add a description... (Markdown supported)"
          style={{
            width: '100%', minHeight: `${minHeight}px`,
            padding: '20px', background: 'transparent', border: 'none',
            color: 'var(--text-primary)', fontSize: '14.5px', lineHeight: '1.8',
            outline: 'none', resize: 'none', overflow: 'hidden',
            fontFamily: '"Geist Mono", "Courier New", monospace',
          }}
        />
      ) : (
        <div style={{ padding: '20px', minHeight: `${minHeight}px` }}>
          {draftValue
            ? <MarkdownRenderer content={draftValue} />
            : <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', fontStyle: 'italic' }}>Nothing to preview.</p>
          }
        </div>
      )}
    </div>
  );
}
