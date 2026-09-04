import { BriefEditorAdapter } from './brief-editor-adapter';

/**
 * The plain markdown field the brief falls back to when the code editor cannot be loaded. It
 * carries the same toolbar, outline, and preview, because every command is expressed against the
 * source and its selection rather than against the editor.
 */
export function createTextareaEditor(area: HTMLTextAreaElement): BriefEditorAdapter {
  let onChange: () => void = () => undefined;
  let onCursor: (offset: number) => void = () => undefined;

  const report = (): void => onCursor(area.selectionStart);
  area.addEventListener('input', () => {
    onChange();
    report();
  });
  area.addEventListener('keyup', report);
  area.addEventListener('click', report);
  area.addEventListener('select', report);

  return {
    kind: 'textarea',
    getState: () => ({ text: area.value, start: area.selectionStart, end: area.selectionEnd }),
    apply: (next) => {
      area.value = next.text;
      area.setSelectionRange(next.start, next.end);
      area.focus();
      onChange();
      report();
    },
    getValue: () => area.value,
    setValue: (text) => {
      area.value = text;
      area.setSelectionRange(0, 0);
      report();
    },
    focus: () => area.focus(),
    revealLine: (line) => {
      const lines = area.value.split('\n').slice(0, line - 1);
      const offset = lines.join('\n').length + (line > 1 ? 1 : 0);
      area.focus();
      area.setSelectionRange(offset, offset);
      // No line metrics are available here, so scroll proportionally.
      const total = Math.max(area.value.split('\n').length, 1);
      area.scrollTop = Math.max(0, ((line - 1) / total) * area.scrollHeight - 40);
      report();
    },
    positionAt: (offset) => {
      const before = area.value.slice(0, offset).split('\n');
      return { line: before.length, column: before[before.length - 1].length + 1 };
    },
    onChange: (handler) => {
      onChange = handler;
    },
    onCursor: (handler) => {
      onCursor = handler;
    },
    layout: () => undefined,
    dispose: () => undefined,
  };
}
