/** One choice in a segmented switch: the value it selects and the label that names it. */
export interface SegmentedOption {
  readonly value: string;
  readonly label: string;
  readonly title?: string;
}
