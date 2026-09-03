import { HttpErrorResponse } from '@angular/common/http';
import { ApiProblem } from '../models/api-problem';

export function presentApiError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const problem = error.error as Partial<ApiProblem> | null;
    const fieldErrors = problem?.errors ? Object.values(problem.errors).flat() : [];
    return fieldErrors[0] ?? problem?.detail ?? (error.status === 0 ? 'The server could not be reached.' : 'The request could not be completed.');
  }
  return 'The request could not be completed.';
}

