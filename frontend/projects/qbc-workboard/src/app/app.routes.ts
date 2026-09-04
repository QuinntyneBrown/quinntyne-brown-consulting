import { Routes } from '@angular/router';
import { unlockedGuard } from './core/unlocked.guard';
import { unsavedBriefGuard } from './features/initiative-brief/unsaved-brief.guard';
import { AppShellComponent } from './shell/app-shell.component';

/** The one surface an initiative is written on, whether it is being created or edited. */
const initiativeEditor = () =>
  import('./features/initiative-brief/initiative-brief-page.component').then(
    (value) => value.InitiativeBriefPageComponent,
  );

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
      // Ahead of the identified route, which would otherwise read "new" as an initiative's ID.
      {
        path: 'initiatives/new',
        loadComponent: initiativeEditor,
        title: 'New initiative · QBC Workboard',
        canDeactivate: [unsavedBriefGuard],
      },
      {
        path: 'initiatives/:initiativeId',
        loadComponent: initiativeEditor,
        title: 'Edit initiative · QBC Workboard',
        canDeactivate: [unsavedBriefGuard],
      },
      // The brief used to have a route of its own, before the name moved onto the same page.
      { path: 'initiatives/:initiativeId/brief', redirectTo: 'initiatives/:initiativeId' },
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
