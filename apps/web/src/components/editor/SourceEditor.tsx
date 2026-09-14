'use client';

import React, { useRef, useEffect } from 'react';
import Editor, { useMonaco, type BeforeMount, type OnMount } from '@monaco-editor/react';

interface SourceEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  language?: string;
  readOnly?: boolean;
  highlightLine?: number;
}

/* ── Theme definition (registered before mount) ────────────────────── */
const handleBeforeMount: BeforeMount = (monaco) => {
  monaco.editor.defineTheme('explain-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '555870', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'ffffff', fontStyle: 'bold' },
      { token: 'string', foreground: '34d399' },
      { token: 'number', foreground: 'fbbf24' },
      { token: 'type', foreground: '6b8aff' },
    ],
    colors: {
      'editor.background': '#0a0c14',
      'editor.foreground': '#e8eaf0',
      'editor.lineHighlightBackground': '#ffffff06',
      'editor.selectionBackground': '#6b8aff30',
      'editorCursor.foreground': '#6b8aff',
      'editor.inactiveSelectionBackground': '#6b8aff15',
      'editorLineNumber.foreground': '#333650',
      'editorLineNumber.activeForeground': '#6b8aff',
      'editorGutter.background': '#0a0c14',
      'editorWidget.background': '#0d0f18',
      'editorWidget.border': '#ffffff0f',
      'scrollbar.shadow': '#00000000',
      'scrollbarSlider.background': '#ffffff10',
      'scrollbarSlider.hoverBackground': '#ffffff1a',
      'scrollbarSlider.activeBackground': '#ffffff22',
    },
  });
};

export function SourceEditor({
  code,
  onChange,
  language = 'plaintext',
  readOnly = false,
  highlightLine,
}: SourceEditorProps) {
  const monaco = useMonaco();
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const decorationsRef = useRef<{ clear: () => void } | null>(null);

  /* ── Highlight active line ──────────────────────────────────────── */
  useEffect(() => {
    if (monaco && editorRef.current) {
      if (highlightLine) {
        decorationsRef.current = editorRef.current.createDecorationsCollection([
          {
            range: new monaco.Range(highlightLine, 1, highlightLine, 1),
            options: {
              isWholeLine: true,
              className: 'bg-blue-100 dark:bg-blue-900/40',
            },
          },
        ]);
      } else {
        if (decorationsRef.current) {
          decorationsRef.current.clear();
        }
      }
    }

    return () => {
      if (decorationsRef.current) decorationsRef.current.clear();
    };
  }, [highlightLine, monaco]);

  /* ── Suppress Monaco internal cancellation rejections ─────────── */
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      if (
        event?.reason?.type === 'cancelation' ||
        event?.reason?.msg === 'operation is manually canceled' ||
        event?.reason?.message === 'operation is manually canceled'
      ) {
        event.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  return (
    <div
      className="w-full h-full overflow-hidden"
      style={{
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-subtle)',
        background: '#0a0c14',
      }}
    >
      <Editor
        height="100%"
        language={language}
        theme="explain-dark"
        value={code}
        onChange={onChange}
        beforeMount={handleBeforeMount}
        onMount={handleEditorDidMount}
        loading={
          <div
            style={{
              width: '100%',
              height: '100%',
              background: '#0a0c14',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#555870',
              fontSize: 13,
            }}
          >
            Loading editor…
          </div>
        }
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: 'var(--font-mono)',
          fontLigatures: true,
          wordWrap: 'on',
          readOnly: readOnly,
          scrollBeyondLastLine: false,
          padding: { top: 20, bottom: 20 },
          lineNumbers: 'on',
          renderLineHighlight: 'gutter',
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          scrollbar: {
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
          },
          contextmenu: false,
          smoothScrolling: true,
          cursorSmoothCaretAnimation: 'on',
          cursorBlinking: 'smooth',
        }}
      />
    </div>
  );
}
