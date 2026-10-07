import { expect, Page } from '@playwright/test';

/** The one browser-storage value the product is allowed to hold: the workspace credential. */
const CREDENTIAL_KEY = 'qbc.workboard.access-token';

/**
 * Observes what the browser is keeping for the workspace. Product records belong to the backend,
 * so the only thing this looks for is the session credential and the absence of everything else.
 */
export class StoragePage {
  constructor(private readonly page: Page) {}

  async expectOnlyCredentialStored(): Promise<void> {
    const stored = await this.page.evaluate(() => ({
      local: Object.keys(window.localStorage),
      session: Object.keys(window.sessionStorage),
    }));
    expect(stored.local, 'the browser is holding product data').toEqual([CREDENTIAL_KEY]);
    expect(stored.session, 'the browser is holding product data').toEqual([]);
  }

  async clearEverythingExceptTheCredential(): Promise<void> {
    await this.page.evaluate((key) => {
      const credential = window.localStorage.getItem(key);
      window.localStorage.clear();
      window.sessionStorage.clear();
      if (credential !== null) window.localStorage.setItem(key, credential);
    }, CREDENTIAL_KEY);
  }

  async discardCredential(): Promise<void> {
    await this.page.evaluate((key) => window.localStorage.removeItem(key), CREDENTIAL_KEY);
  }

  async expectNoCredentialHeld(): Promise<void> {
    await expect
      .poll(() => this.page.evaluate((key) => window.localStorage.getItem(key), CREDENTIAL_KEY))
      .toBeNull();
  }
}
