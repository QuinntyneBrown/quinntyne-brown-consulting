/**
 * Joins a count to the noun it counts, in the singular for exactly one. Nouns whose plural is not
 * the singular plus `s` pass their own, as `story` does.
 */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
