/**
 * Divides one total across `count` stories the way the API does (`L2-058`): every story receives
 * the largest quarter-hour share that fits, and the remainder lands on the first. Computed in whole
 * quarter hours so 0.1 + 0.2 arithmetic cannot leave a share the API would refuse.
 */
export function splitHours(total: number, count: number): number[] {
  if (count < 1) return [];
  const quarters = Math.round(total * 4);
  const base = Math.floor(quarters / count);
  const shares = new Array<number>(count).fill(base / 4);
  shares[0] = (quarters - base * (count - 1)) / 4;
  return shares;
}
