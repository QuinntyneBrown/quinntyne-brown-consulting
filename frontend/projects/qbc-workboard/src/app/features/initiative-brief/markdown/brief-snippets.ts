/** One insertable building block, named as the writer chooses it. */
export interface BriefSnippet {
  readonly key: string;
  readonly label: string;
  readonly body: string;
}

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

export const BRIEF_SNIPPETS: readonly BriefSnippet[] = [
  { key: 'template', label: 'Outcome brief template', body: BRIEF_TEMPLATE },
  {
    key: 'outcome',
    label: 'Outcome statement',
    body: [
      '## Outcome',
      '',
      'A <role> can <do the thing> in <constraint>, so that <benefit>.',
    ].join('\n'),
  },
  {
    key: 'signals',
    label: 'Success signals table',
    body: [
      '## Success signals',
      '',
      '| Signal | Baseline | Target |',
      '| --- | --- | --- |',
      '| <what is measured> | <today> | <after> |',
      '| <what is measured> | <today> | <after> |',
    ].join('\n'),
  },
  {
    key: 'epics',
    label: 'Epic checklist',
    body: ['## Epics', '', '- [ ] <epic name>', '- [ ] <epic name>'].join('\n'),
  },
  {
    key: 'risk',
    label: 'Risk callout',
    body: ['> **Risk** — <what could go wrong>.', '> Owner: <name>. Reviewed: <date>.'].join('\n'),
  },
];
