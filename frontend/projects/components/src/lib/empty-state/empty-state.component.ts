import { Component, booleanAttribute, computed, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icon-name';

@Component({
  selector: 'qbc-empty-state',
  imports: [IconComponent],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly description = input('');
  readonly icon = input<IconName>('empty');
  readonly bare = input(false, { transform: booleanAttribute });
  readonly copy = computed(() => this.subtitle() || this.description());
}
