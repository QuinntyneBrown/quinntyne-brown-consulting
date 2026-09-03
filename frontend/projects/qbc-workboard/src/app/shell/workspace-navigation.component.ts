import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-workspace-navigation',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './workspace-navigation.component.html',
  styleUrl: './workspace-navigation.component.scss'
})
export class WorkspaceNavigationComponent {
  readonly open = input(false);
  readonly navigated = output<void>();
}

