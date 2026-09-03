import { Routes } from '@angular/router';
import { unlockedGuard } from './core/unlocked.guard';
import { AppShellComponent } from './shell/app-shell.component';

export const routes: Routes = [
  {
    path: 'unlock',
    loadComponent: () =>
      import('./features/access/unlock-page.component').then((value) => value.UnlockPageComponent),
    title: 'Enter your passcode · QBC Workboard',
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [unlockedGuard],
    children: [
      {
        path: 'board',
        loadComponent: () =>
          import('./features/board/board-page.component').then((value) => value.BoardPageComponent),
        title: 'Board · QBC Workboard',
      },
      {
        path: 'backlog',
        loadComponent: () =>
          import('./features/backlog/backlog-page.component').then(
            (value) => value.BacklogPageComponent,
          ),
        title: 'Backlog · QBC Workboard',
      },
      {
        path: 'initiatives',
        loadComponent: () =>
          import('./features/hierarchy/hierarchy-page.component').then(
            (value) => value.HierarchyPageComponent,
          ),
        title: 'Initiatives · QBC Workboard',
      },
      {
        path: 'assistants',
        loadComponent: () =>
          import('./features/assistants/assistants-page.component').then(
            (value) => value.AssistantsPageComponent,
          ),
        title: 'Assistants · QBC Workboard',
      },
      { path: '', pathMatch: 'full', redirectTo: 'board' },
    ],
  },
  { path: '**', redirectTo: 'board' },
];
