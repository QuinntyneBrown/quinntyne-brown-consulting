import { BriefHeading } from './brief-heading';

/** The brief's headings in document order, so the outline can move the editor to any of them. */
export function readOutline(source: string): readonly BriefHeading[] {
  const headings: BriefHeading[] = [];
  source.split('\n').forEach((line, position) => {
    const match = /^(#{1,6})\s+(.*)$/.exec(line);
    if (match !== null && match[2].trim()) {
      headings.push({
        level: match[1].length,
        text: match[2].replace(/[*_`~]/g, '').trim(),
        line: position + 1,
        id: `brief-heading-${position}`,
      });
    }
  });
  return headings;
}
