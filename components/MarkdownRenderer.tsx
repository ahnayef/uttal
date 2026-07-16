'use client';
import { useEffect, useState } from 'react';

export default function MarkdownRenderer({ content }: { content: string }) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    if (!content) return;
    let ignore = false;

    import('marked').then(({ marked }) => {
      const result = marked.parse(content, { breaks: true });
      if (typeof result === 'string') {
        if (!ignore) setHtml(result);
      } else {
        (result as Promise<string>).then(parsed => {
          if (!ignore) setHtml(parsed);
        });
      }
    });

    return () => {
      ignore = true;
    };
  }, [content]);

  return (
    <div
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: content ? html : '' }}
    />
  );
}
