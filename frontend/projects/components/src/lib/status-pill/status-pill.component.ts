import { Component, input } from '@angular/core';
import { PillComponent } from '../pill/pill.component';
import { StatusPillTone } from './status-pill-tone';

@Component({
  selector: 'qbc-status-pill',
  imports: [PillComponent],
  templateUrl: './status-pill.component.html',
  styleUrl: './status-pill.component.scss',
})
export class StatusPillComponent {
  readonly tone = input<StatusPillTone>('muted');
  readonly label = input<string | null>(null);
}
