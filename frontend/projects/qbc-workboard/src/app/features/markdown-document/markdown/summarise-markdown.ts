/**
 * The one line that stands for a whole document where there is only room for one: the first line of
 * prose, with its markdown marks removed. Headings, quotes, and table rows are skipped, because a
 * document that opens with its title or a table would otherwise be summarised by scaffolding rather
 * than by what it says. The fallback names what is missing, which differs per record.
 */
export function summariseMarkdown(markdown: string, fallback: string): string {
  const prose = markdown.split('\n').find((line) => line.trim() && !/^[#>|]/.test(line.trim()));
  return prose === undefined ? fallback : prose.replace(/[*_`]/g, '');
}
