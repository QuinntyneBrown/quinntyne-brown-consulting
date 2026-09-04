import { Component, computed, input } from '@angular/core';
import { ProgressComponent } from '../progress/progress.component';
import { pluralize } from '../text/pluralize';
@Component({
  selector: 'qbc-epic-row',
  imports: [ProgressComponent],
  templateUrl: './epic-row.component.html',
  styleUrl: './epic-row.component.scss',
  host: { class: 'epic-row' },
})
export class EpicRowComponent {
  readonly title = input('Untitled epic');
  readonly summary = input('');
  readonly storyCount = input(0);
  readonly progress = input(0);
  readonly storyLabel = computed(() => pluralize(this.storyCount(), 'story', 'stories'));
}
