/**
 * Renders the subset of markdown an outcome brief uses: headings, paragraphs, emphasis, links,
 * inline and fenced code, bulleted, numbered and task lists with nesting, blockquotes, tables, and
 * dividers.
 *
 * Every value is escaped before it reaches the output and link targets are restricted, so the
 * result carries no markup the author did not write. The template binds the result through
 * `innerHTML`, which sanitizes it a second time, so nothing here is trusted on its own.
 */
const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

const escapeHtml = (text: string): string =>
  String(text).replace(/[&<>"]/g, (character) => HTML_ESCAPES[character]);

/**
 * Only the link targets a brief legitimately needs: absolute http(s), mail, in-page anchors, and
 * repository-relative paths. Anything else is left as written rather than turned into a link.
 */
const safeHref = (raw: string): string | null => {
  const href = raw.trim();
  return /^(https?:\/\/|mailto:|#|\.{0,2}\/)/i.test(href) ? href : null;
};

/**
 * Emphasis, links, and strikethrough. The caller has already escaped the text and has already
 * lifted out inline code, so nothing here can be confused by a backtick span.
 */
const renderEmphasis = (escaped: string): string =>
  escaped
    .replace(
      /!?\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;[^&]*&quot;)?\)/g,
      (match, label: string, target: string) => {
        const href = safeHref(target);
        return href === null ? match : `<a href="${escapeHtml(href)}">${label}</a>`;
      },
    )
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/(^|[^\w\\])_([^_\n]+)_/g, '$1<em>$2</em>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>');

const renderInline = (text: string): string =>
  escapeHtml(text)
    .split(/(`[^`]+`)/)
    .map((part) =>
      part.length > 1 && part.startsWith('`') && part.endsWith('`')
        ? `<code>${part.slice(1, -1)}</code>`
        : renderEmphasis(part),
    )
    .join('');

const LIST_ITEM = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const TABLE_DIVIDER = /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;
const BLOCK_START = /^(#{1,6}\s|\s*>|\s*(```|~~~))/;
const DIVIDER = /^\s*(-{3,}|\*{3,}|_{3,})\s*$/;

const splitRow = (line: string): string[] =>
  line
    .replace(/^\s*\|/, '')
    .replace(/\|\s*$/, '')
    .split('|')
    .map((cell) => cell.trim());

/**
 * Opens a list item without closing it, because a deeper list belongs inside the item that
 * introduced it rather than beside it.
 */
const openListItem = (content: string): string => {
  const task = /^\[([ xX])\]\s+(.*)$/.exec(content);
  if (task === null) return `<li>${renderInline(content)}`;

  const done = task[1].toLowerCase() === 'x';
  const box = `<span class="task-box${done ? ' is-done' : ''}" aria-hidden="true">${
    done ? '[x]' : '[ ]'
  }</span>`;
  const text = `<span${done ? ' class="is-done-text"' : ''}>${renderInline(task[2])}</span>`;
  return `<li>${box}${text}`;
};

export function renderMarkdown(source: string): string {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const out: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = /^\s*(```|~~~)\s*[\w-]*\s*$/.exec(line);
    if (fence !== null) {
      const marker = fence[1];
      const body: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith(marker)) {
        body.push(lines[index]);
        index += 1;
      }
      index += 1;
      out.push(`<pre><code>${escapeHtml(body.join('\n'))}</code></pre>`);
      continue;
    }

    if (DIVIDER.test(line)) {
      out.push('<hr>');
      index += 1;
      continue;
    }

    // The id carries the source line, so the outline can scroll the preview to the same place it
    // scrolls the editor.
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading !== null) {
      const level = heading[1].length;
      const text = renderInline(heading[2].replace(/\s+#+\s*$/, ''));
      out.push(`<h${level} id="brief-heading-${index}">${text}</h${level}>`);
      index += 1;
      continue;
    }

    // A quote renders recursively, so it can hold emphasis, a list, or more than one paragraph.
    if (/^\s*>/.test(line)) {
      const quoted: string[] = [];
      while (index < lines.length && /^\s*>/.test(lines[index])) {
        quoted.push(lines[index].replace(/^\s*>\s?/, ''));
        index += 1;
      }
      out.push(`<blockquote>${renderMarkdown(quoted.join('\n'))}</blockquote>`);
      continue;
    }

    if (
      line.trim().startsWith('|') &&
      index + 1 < lines.length &&
      TABLE_DIVIDER.test(lines[index + 1])
    ) {
      const head = splitRow(line);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && lines[index].trim().startsWith('|')) {
        rows.push(splitRow(lines[index]));
        index += 1;
      }
      const headCells = head.map((cell) => `<th>${renderInline(cell)}</th>`).join('');
      const bodyRows = rows
        .map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell)}</td>`).join('')}</tr>`)
        .join('');
      out.push(`<table><thead><tr>${headCells}</tr></thead><tbody>${bodyRows}</tbody></table>`);
      continue;
    }

    // Lists. Every two leading spaces open one nesting level.
    if (LIST_ITEM.test(line)) {
      const stack: string[] = [];
      let itemOpen = false;

      const closeList = (): void => {
        if (itemOpen) out.push('</li>');
        out.push(`</${stack.pop()}>`);
        // Closing a nested list returns to the item that contained it, which is still open.
        itemOpen = stack.length > 0;
      };

      while (index < lines.length && LIST_ITEM.test(lines[index])) {
        const item = LIST_ITEM.exec(lines[index]);
        if (item === null) break;
        const depth = Math.min(Math.floor(item[1].replace(/\t/g, '  ').length / 2), 3);
        const tag = /\d/.test(item[2]) ? 'ol' : 'ul';
        const isTask = /^\[[ xX]\]\s+/.test(item[3]);

        while (stack.length > depth + 1) closeList();
        if (stack.length === depth + 1 && stack[depth] !== tag) closeList();
        while (stack.length < depth + 1) {
          out.push(`<${tag}${isTask ? ' class="task-list"' : ''}>`);
          stack.push(tag);
          itemOpen = false;
        }

        if (itemOpen) out.push('</li>');
        out.push(openListItem(item[3]));
        itemOpen = true;
        index += 1;
      }
      while (stack.length) closeList();
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !BLOCK_START.test(lines[index]) &&
      !LIST_ITEM.test(lines[index]) &&
      !DIVIDER.test(lines[index])
    ) {
      paragraph.push(lines[index]);
      index += 1;
    }
    if (paragraph.length) {
      // A single newline inside a paragraph is a soft wrap, as in every other markdown reader.
      // Only a line ending in two spaces breaks.
      const flowed = paragraph
        .map((entry, position) => {
          if (position === paragraph.length - 1) return entry.replace(/\s+$/, '');
          return / {2,}$/.test(entry)
            ? `${entry.replace(/\s+$/, '')}\n`
            : `${entry.replace(/\s+$/, '')} `;
        })
        .join('');
      out.push(`<p>${renderInline(flowed).replace(/\n/g, '<br>')}</p>`);
    } else {
      index += 1;
    }
  }

  return out.join('\n');
}
