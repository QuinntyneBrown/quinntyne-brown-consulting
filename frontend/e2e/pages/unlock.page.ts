import { expect, Locator, Page } from '@playwright/test';
import type { WorkspaceRoute } from './workboard.page';

export class UnlockPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/');
    await this.expectPrompt();
  }

  async openProtectedRoute(route: WorkspaceRoute): Promise<void> {
    await this.page.goto(`/${route}`);
  }

  async expectPrompt(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { level: 1, name: 'Enter your passcode' }),
    ).toBeVisible();
  }

  /** The passcode screen stands alone: none of the workspace chrome is present. */
  async expectNoWorkspaceChrome(): Promise<void> {
    await expect(this.page.locator('qbc-sidebar')).toHaveCount(0);
    await expect(this.page.locator('qbc-topbar')).toHaveCount(0);
    await expect(this.page.getByText('Workspace /')).toHaveCount(0);
  }

  /** Typing the last digit submits on its own, with no further action to take. */
  async enter(passcode: string): Promise<void> {
    await this.field().fill(passcode);
  }

  async expectRejection(): Promise<void> {
    await expect(this.page.getByRole('alert')).toContainText('That passcode is not right.');
    await this.expectPrompt();
  }

  async expectThrottled(): Promise<void> {
    await expect(this.page.getByRole('alert')).toContainText(
      'Too many passcode attempts. Try again later.',
    );
    await this.expectPrompt();
  }

  /**
   * A refusal is announced to assistive technology through the field's own error region, and the
   * field is emptied and given focus back so the next attempt needs no pointer.
   */
  async expectRefusalAnnouncedAndFieldReady(): Promise<void> {
    const error = this.page.getByRole('alert');
    await expect(error).toHaveAttribute('id', 'unlock-error');
    await expect(this.field()).toHaveAttribute('aria-describedby', 'unlock-error');
    await expect(this.field()).toHaveValue('');
    await expect(this.field()).toBeFocused();
  }

  /** Acceptance is confirmed on screen before the workspace replaces it. */
  async expectConfirmationBeforeWorkspace(): Promise<void> {
    await expect(this.page.getByRole('heading', { level: 1, name: 'Unlocked' })).toBeVisible();
    await this.expectUnlockedWorkspace();
  }

  async expectBuildVersions(...labels: string[]): Promise<void> {
    const builds = this.builds();
    for (const label of labels) await expect(builds).toContainText(label);
  }

  async expectNoBackendBuildVersion(): Promise<void> {
    await expect(this.builds()).not.toContainText('Backend');
  }

  /** Nothing that needs a workspace session was asked for while the screen was shown. */
  expectNoWorkspaceDataRequested(gatedRequests: readonly string[]): void {
    expect(gatedRequests, 'a work-management request was issued while locked out').toEqual([]);
  }

  async expectNoErrorPresented(): Promise<void> {
    await expect(this.page.getByRole('alert')).toHaveText('');
  }

  async expectUnlockedWorkspace(): Promise<void> {
    await expect(this.page.getByRole('heading', { level: 1, name: 'Sprint board' })).toBeVisible();
  }

  private field(): Locator {
    return this.page.getByLabel('Workspace passcode');
  }

  private builds(): Locator {
    return this.page.getByLabel('Build versions');
  }
}
