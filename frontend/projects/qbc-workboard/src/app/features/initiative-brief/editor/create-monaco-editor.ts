import { BriefEditorHandle } from './brief-editor-handle';

const BRIEF_SOURCE_LABEL = 'Initiative brief, markdown source';
const EDITOR_STYLESHEET = 'monaco-editor.css';

let stylesheetLoad: Promise<void> | null = null;

/**
 * Fetches the editor's own stylesheet, which the bundler publishes beside the application under a
 * fixed name rather than folding into the page styles every reader downloads. The editor's markup
 * relies on it to place the writing surface and to keep its scaffolding — the screen reader's live
 * region and the hidden field that carries typing — out of sight, so the editor is only created
 * once the stylesheet has arrived. A stylesheet that never arrives fails the editor, which the
 * page reports, rather than presenting a surface that renders as scrambled text.
 */
function loadEditorStylesheet(): Promise<void> {
  stylesheetLoad ??= new Promise<void>((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = EDITOR_STYLESHEET;
    link.addEventListener('load', () => resolve());
    link.addEventListener('error', () =>
      reject(new Error('The markdown editor stylesheet could not be loaded.')),
    );
    document.head.append(link);
  });
  return stylesheetLoad;
}

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
): Promise<BriefEditorHandle> {
  // The editor resolves its worker relative to its own module by default, which the application
  // bundler does not emit. Naming the worker here lets the bundler own it like any other chunk.
  (self as unknown as { MonacoEnvironment?: { getWorker: () => Worker } }).MonacoEnvironment = {
    getWorker: () =>
      new Worker(new URL('./brief-editor.worker', import.meta.url), {
        type: 'module',
      }),
  };

  const [monaco] = await Promise.all([import('monaco-editor'), loadEditorStylesheet()]);

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

  model.onDidChangeContent(() => onChange());

  return {
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
    onChange: (handler) => {
      onChange = handler;
    },
    layout: () => editor.layout(),
    dispose: () => editor.dispose(),
  };
}
