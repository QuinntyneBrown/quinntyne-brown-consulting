import { Component, input } from '@angular/core';

@Component({
  selector: 'qbc-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss'
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
