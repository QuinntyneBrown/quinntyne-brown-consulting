import { Component, computed, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import {
  AppShellComponent as QbcAppShellComponent,
  BrandComponent,
  ButtonComponent,
  NavItemComponent,
  SidebarComponent,
  ToastComponent,
  TopbarComponent,
} from '@qbc/components';
import { filter } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { FEEDBACK_SERVICE } from '../core/feedback.service.contract';
import { WORKSPACE_SERVICE } from '../core/workspace.service.contract';
import { STORY_EDITOR_SERVICE } from '../features/stories/story-editor.service.contract';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    QbcAppShellComponent,
    BrandComponent,
    ButtonComponent,
    NavItemComponent,
    SidebarComponent,
    ToastComponent,
    TopbarComponent,
  ],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  private readonly router = inject(Router);
  private readonly workspace = inject(WORKSPACE_SERVICE);
  private readonly editor = inject(STORY_EDITOR_SERVICE);
  readonly feedback = inject(FEEDBACK_SERVICE);
  readonly menuOpen = signal(false);
  private readonly navigation = toSignal(
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)),
    { initialValue: null },
  );
  private readonly routeSegment = computed(() => {
    this.navigation();
    return this.router.url.split('?')[0].split('/')[1] || 'board';
  });
  readonly routeName = computed(() => {
    const segment = this.routeSegment();
    return segment === 'initiatives'
      ? 'Initiatives'
      : segment.charAt(0).toUpperCase() + segment.slice(1);
  });

  constructor() {
    effect(() => void this.workspace.load(this.routeSegment()));
  }

  openNewStory(): void {
    this.editor.openNew();
  }
}
