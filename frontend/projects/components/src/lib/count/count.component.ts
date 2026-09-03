import { Component, input } from '@angular/core';
@Component({
  selector: 'qbc-count',
  templateUrl: './count.component.html',
  styleUrl: './count.component.scss',
})
export class CountComponent {
  readonly value = input<number | string>(0);
}
