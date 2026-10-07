/**
 * Transport behaviour a scenario can ask the mock for. The product rules the mock enforces are
 * fixed by the API contract; these switches only reproduce conditions the network imposes, so a
 * test can observe pending, throttled, and unreachable states through the rendered UI.
 */
export interface WorkboardApiFault {
  /** Hold every request whose path matches this expression for `delayMs` before answering. */
  delayPath: RegExp | null;
  delayMs: number;
  /** Answer the unlock resource with HTTP 429 without evaluating the passcode. */
  throttleUnlock: boolean;
  /** Answer the version resource as unreachable. */
  versionUnreachable: boolean;
  /** Refuse the credential the browser holds, as the server does once a session ends. */
  rejectSession: boolean;
}

export function createWorkboardApiFault(): WorkboardApiFault {
  return {
    delayPath: null,
    delayMs: 0,
    throttleUnlock: false,
    versionUnreachable: false,
    rejectSession: false,
  };
}
