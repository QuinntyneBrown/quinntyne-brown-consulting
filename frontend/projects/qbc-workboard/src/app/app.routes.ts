import { Routes } from '@angular/router';

export const routes: Routes = [
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
  { path: '**', redirectTo: 'board' },
];
