import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tabs, Textarea } from '@repo/ui';

export type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter content in Markdown format...',
  rows = 10,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  return (
    <div className={className}>
      <Tabs
        tabs={[
          {
            key: 'edit',
            label: 'Edit',
            content: (
              <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="font-mono text-sm"
              />
            ),
          },
          {
            key: 'preview',
            label: 'Preview',
            content: (
              <div className="border rounded-md p-4 min-h-[200px] prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {value || 'Nothing to preview...'}
                </ReactMarkdown>
              </div>
            ),
          },
        ]}
        defaultTab="edit"
      />
    </div>
  );
};