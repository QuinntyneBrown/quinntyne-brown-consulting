export interface ApiProblem {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly detail: string;
  readonly errors?: Readonly<Record<string, readonly string[]>>;
  readonly context?: unknown;
}

