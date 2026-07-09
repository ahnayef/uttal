'use client';
import { useEffect, useState } from 'react';

export default function MarkdownRenderer({ content }: { content: string }) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    if (!content) { setHtml(''); return; }
    import('marked').then(({ marked }) => {
      const result = marked.parse(content, { breaks: true });
      if (typeof result === 'string') {
        setHtml(result);
      } else {
        (result as Promise<string>).then(setHtml);
      }
    });
  }, [content]);

  return (
    <div
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
