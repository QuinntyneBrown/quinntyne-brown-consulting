export interface FeedbackMessage {
  readonly text: string;
  readonly kind: 'success' | 'error';
}
