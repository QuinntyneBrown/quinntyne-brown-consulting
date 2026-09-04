/**
 * The house shape of an outcome brief, written as it lands in the document so a writer can see the
 * expected structure without typing it.
 */
export const BRIEF_TEMPLATE = [
  '# <Initiative name>',
  '',
  'One paragraph on the change this initiative makes, and why it is worth',
  'the next quarter of delivery.',
  '',
  '## Outcome',
  '',
  'The observable result, written from the point of view of the person who',
  'benefits from it.',
  '',
  '## Success signals',
  '',
  '| Signal | Baseline | Target |',
  '| --- | --- | --- |',
  '| <what is measured> | <today> | <after> |',
  '',
  '## Guardrails',
  '',
  '- <a constraint delivery must respect>',
  '',
  '## Epics',
  '',
  '- [ ] <epic name>',
  '',
  '## Open questions',
  '',
  '1. <question that still needs an owner>',
].join('\n');
