import { EditorSelection } from './editor-selection';

/**
 * Every toolbar command is a pure transform over the markdown source and its selection. Both the
 * code editor and the plain markdown field express their state that way, so one implementation
 * drives both.
 */
const wrapSelection = (
  text: string,
  start: number,
  end: number,
  before: string,
  after: string,
  placeholder: string,
): EditorSelection => {
  const hasSelection = end > start;
  const selected = hasSelection ? text.slice(start, end) : placeholder;

  // Pressing the same button twice removes the marks it added.
  if (
    text.slice(start - before.length, start) === before &&
    text.slice(end, end + after.length) === after
  ) {
    return {
      text: text.slice(0, start - before.length) + selected + text.slice(end + after.length),
      start: start - before.length,
      end: start - before.length + selected.length,
    };
  }
  if (
    selected.startsWith(before) &&
    selected.endsWith(after) &&
    selected.length > before.length + after.length
  ) {
    const inner = selected.slice(before.length, selected.length - after.length);
    return {
      text: text.slice(0, start) + inner + text.slice(end),
      start,
      end: start + inner.length,
    };
  }

  return {
    text: text.slice(0, start) + before + selected + after + text.slice(end),
    start: start + before.length,
    end: start + before.length + selected.length,
  };
};

const lineBounds = (text: string, start: number, end: number): { from: number; to: number } => {
  const from = text.lastIndexOf('\n', start - 1) + 1;
  const lineEnd = text.indexOf('\n', end);
  return { from, to: lineEnd === -1 ? text.length : lineEnd };
};

/**
 * Adds a line prefix to every selected line, or removes it when every non-blank line already
 * carries one. `prefixFor` receives the position of the line in the block, so numbered lists count.
 */
const togglePrefix = (
  text: string,
  start: number,
  end: number,
  pattern: RegExp,
  prefixFor: (position: number) => string,
): EditorSelection => {
  const bounds = lineBounds(text, start, end);
  const lines = text.slice(bounds.from, bounds.to).split('\n');
  const meaningful = lines.filter((line) => line.trim());
  const allPrefixed = meaningful.length > 0 && meaningful.every((line) => pattern.test(line));

  const next = lines
    .map((line, position) => {
      if (allPrefixed) return line.replace(pattern, '');
      if (!line.trim() && lines.length > 1) return line;
      return prefixFor(position) + line;
    })
    .join('\n');

  return {
    text: text.slice(0, bounds.from) + next + text.slice(bounds.to),
    start: bounds.from,
    end: bounds.from + next.length,
  };
};

/** Drops a block at the cursor, on its own line, with one blank line of air above and below it. */
export function insertBlock(
  text: string,
  start: number,
  end: number,
  block: string,
): EditorSelection {
  const bounds = lineBounds(text, start, end);
  const before = text.slice(0, bounds.from).replace(/\n*$/, '');
  const after = text.slice(bounds.to).replace(/^\n*/, '');
  const current = text.slice(bounds.from, bounds.to).trim();

  const head = before ? `${before}\n\n` : '';
  const body = (current ? `${current}\n\n` : '') + block.replace(/\n+$/, '');
  const tail = after ? `\n\n${after}` : '\n';

  return {
    text: head + body + tail,
    start: head.length + body.length,
    end: head.length + body.length,
  };
}

export type MarkdownCommand = (state: EditorSelection) => EditorSelection;

export const MARKDOWN_COMMANDS: Readonly<Record<string, MarkdownCommand>> = {
  bold: (state) => wrapSelection(state.text, state.start, state.end, '**', '**', 'bold text'),
  italic: (state) => wrapSelection(state.text, state.start, state.end, '*', '*', 'emphasised text'),
  strike: (state) => wrapSelection(state.text, state.start, state.end, '~~', '~~', 'struck text'),
  code: (state) => wrapSelection(state.text, state.start, state.end, '`', '`', 'code'),
  link: (state) => {
    const hasSelection = state.end > state.start;
    const label = hasSelection ? state.text.slice(state.start, state.end) : 'link text';
    const inserted = `[${label}](https://)`;
    return {
      text: state.text.slice(0, state.start) + inserted + state.text.slice(state.end),
      // Leave the caret inside the parentheses, where the URL goes.
      start: state.start + inserted.length - 1,
      end: state.start + inserted.length - 1,
    };
  },
  heading: (state) => togglePrefix(state.text, state.start, state.end, /^#{1,6}\s+/, () => '## '),
  bullet: (state) => togglePrefix(state.text, state.start, state.end, /^\s*[-*+]\s+/, () => '- '),
  ordered: (state) =>
    togglePrefix(
      state.text,
      state.start,
      state.end,
      /^\s*\d+[.)]\s+/,
      (position) => `${position + 1}. `,
    ),
  task: (state) =>
    togglePrefix(state.text, state.start, state.end, /^\s*[-*+]\s+\[[ xX]\]\s+/, () => '- [ ] '),
  quote: (state) => togglePrefix(state.text, state.start, state.end, /^\s*>\s?/, () => '> '),
  fence: (state) => {
    const selected = state.text.slice(state.start, state.end) || 'code';
    return insertBlock(state.text, state.start, state.end, `\`\`\`text\n${selected}\n\`\`\``);
  },
  table: (state) =>
    insertBlock(
      state.text,
      state.start,
      state.end,
      '| Signal | Baseline | Target |\n| --- | --- | --- |\n| <what is measured> | <today> | <after> |',
    ),
  rule: (state) => insertBlock(state.text, state.start, state.end, '---'),
};
