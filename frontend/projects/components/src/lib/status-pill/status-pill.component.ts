import { Component, input } from '@angular/core';
import { StatusPillTone } from './status-pill-tone';

@Component({
  selector: 'qbc-status-pill',
  templateUrl: './status-pill.component.html',
  styleUrl: './status-pill.component.scss'
})
export class StatusPillComponent {
  readonly tone = input<StatusPillTone>('muted');
  readonly label = input<string | null>(null);
}
