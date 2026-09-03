import { Component, input } from '@angular/core';
import { PillTone } from './pill-tone';

@Component({ selector: 'qbc-pill', templateUrl: './pill.component.html', styleUrl: './pill.component.scss' })
export class PillComponent {
  readonly tone = input<PillTone>('muted');
  readonly label = input<string | null>(null);
}
