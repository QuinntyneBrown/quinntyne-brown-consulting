import { BriefEditorAdapter } from './brief-editor-adapter';

const BRIEF_SOURCE_LABEL = 'Initiative brief, markdown source';

/**
 * The code editor the brief is written in. It is imported only when the brief route is opened, so
 * neither the editor nor its worker reaches a reader who never edits a brief.
 *
 * Auto-closing and auto-surrounding are turned off: a brief is markdown, and inserting a companion
 * bracket or backtick while the author types changes the document they meant to write.
 */
export async function createMonacoEditor(
  host: HTMLElement,
  initialText: string,
): Promise<BriefEditorAdapter> {
  // The editor resolves its worker relative to its own module by default, which the application
  // bundler does not emit. Naming the worker here lets the bundler own it like any other chunk.
  (self as unknown as { MonacoEnvironment?: { getWorker: () => Worker } }).MonacoEnvironment = {
    getWorker: () =>
      new Worker(new URL('./brief-editor.worker', import.meta.url), {
        type: 'module',
      }),
  };

  const monaco = await import('monaco-editor');

  monaco.editor.defineTheme('qbc-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '276749', fontStyle: 'bold' },
      { token: 'keyword.md', foreground: '276749', fontStyle: 'bold' },
      { token: 'strong', foreground: '18201d', fontStyle: 'bold' },
      { token: 'emphasis', foreground: '18201d', fontStyle: 'italic' },
      { token: 'string.link', foreground: '315f88' },
      { token: 'string', foreground: '315f88' },
      { token: 'variable', foreground: '8a6100' },
      { token: 'comment', foreground: '87918c' },
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#18201d',
      'editorLineNumber.foreground': '#a0a9a4',
      'editorLineNumber.activeForeground': '#276749',
      'editor.lineHighlightBackground': '#fbfcfb',
      'editor.selectionBackground': '#e8f3ed',
      'editor.inactiveSelectionBackground': '#f5f7f5',
      'editorCursor.foreground': '#276749',
      'editorWidget.background': '#ffffff',
      'editorWidget.border': '#e4e9e6',
    },
  });

  const editor = monaco.editor.create(host, {
    value: initialText,
    language: 'markdown',
    theme: 'qbc-light',
    ariaLabel: BRIEF_SOURCE_LABEL,
    automaticLayout: true,
    wordWrap: 'on',
    wrappingIndent: 'same',
    lineNumbers: 'off',
    minimap: { enabled: false },
    renderLineHighlight: 'line',
    scrollBeyondLastLine: false,
    fontFamily: getComputedStyle(document.body).getPropertyValue('--qbc-font-mono').trim(),
    fontSize: 14,
    lineHeight: 23,
    padding: { top: 18, bottom: 32 },
    glyphMargin: false,
    overviewRulerLanes: 0,
    scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10, useShadows: false },
    quickSuggestions: false,
    autoIndent: 'none',
    autoClosingBrackets: 'never',
    autoClosingQuotes: 'never',
    autoSurround: 'never',
    // The panes clip their overflow, so the find widget is attached to the page instead.
    fixedOverflowWidgets: true,
    tabSize: 2,
    unicodeHighlight: { ambiguousCharacters: false },
  });

  const model = editor.getModel();
  if (model === null) throw new Error('The markdown editor started without a model.');

  let onChange: () => void = () => undefined;
  let onCursor: (offset: number) => void = () => undefined;

  model.onDidChangeContent(() => onChange());
  editor.onDidChangeCursorPosition((event) => onCursor(model.getOffsetAt(event.position)));

  return {
    kind: 'monaco',
    getState: () => {
      const selection = editor.getSelection();
      if (selection === null) return { text: model.getValue(), start: 0, end: 0 };
      return {
        text: model.getValue(),
        start: model.getOffsetAt(selection.getStartPosition()),
        end: model.getOffsetAt(selection.getEndPosition()),
      };
    },
    apply: (next) => {
      // One edit over the whole model keeps undo working as a single step.
      editor.executeEdits('toolbar', [{ range: model.getFullModelRange(), text: next.text }]);
      const from = model.getPositionAt(next.start);
      const to = model.getPositionAt(next.end);
      editor.setSelection(
        new monaco.Selection(from.lineNumber, from.column, to.lineNumber, to.column),
      );
      editor.focus();
    },
    getValue: () => model.getValue(),
    setValue: (text) => {
      model.setValue(text);
      editor.setPosition({ lineNumber: 1, column: 1 });
      editor.setScrollPosition({ scrollTop: 0 });
    },
    focus: () => editor.focus(),
    revealLine: (line) => {
      editor.revealLineInCenter(line);
      editor.setPosition({ lineNumber: line, column: 1 });
      editor.focus();
    },
    positionAt: (offset) => {
      const position = model.getPositionAt(offset);
      return { line: position.lineNumber, column: position.column };
    },
    onChange: (handler) => {
      onChange = handler;
    },
    onCursor: (handler) => {
      onCursor = handler;
    },
    layout: () => editor.layout(),
    dispose: () => editor.dispose(),
  };
}
