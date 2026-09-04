/**
 * The one line that stands for a whole brief where there is only room for one: the first line of
 * prose, with its markdown marks removed. Headings, quotes, and table rows are skipped, because a
 * brief that opens with its title or its signals table would otherwise be summarised by scaffolding
 * rather than by what it says.
 */
export function summariseBrief(markdown: string): string {
  const prose = markdown.split('\n').find((line) => line.trim() && !/^[#>|]/.test(line.trim()));
  return prose === undefined ? 'No brief written yet.' : prose.replace(/[*_`]/g, '');
}
