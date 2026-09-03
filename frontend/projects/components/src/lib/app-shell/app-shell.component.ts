import { Component } from '@angular/core';
import { SkipLinkComponent } from '../skip-link/skip-link.component';
@Component({
  selector: 'qbc-app-shell',
  imports: [SkipLinkComponent],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {}
