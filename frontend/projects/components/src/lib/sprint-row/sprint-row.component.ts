import { Component, input } from '@angular/core';
import { PillComponent } from '../pill/pill.component';
import { PillTone } from '../pill/pill-tone';
@Component({
  selector: 'qbc-sprint-row',
  imports: [PillComponent],
  templateUrl: './sprint-row.component.html',
  styleUrl: './sprint-row.component.scss',
  host: { class: 'sprint-row' },
})
export class SprintRowComponent {
  readonly name = input('Sprint');
  readonly status = input<PillTone>('planned');
  readonly goal = input('');
  readonly meta = input('');
}
