import { Component, input } from '@angular/core';
@Component({
  selector: 'qbc-data-row',
  templateUrl: './data-row.component.html',
  styleUrl: './data-row.component.scss',
  host: { class: 'data-row' },
})
export class DataRowComponent {
  readonly storyKey = input('QBC-000');
  readonly title = input('Untitled story');
  readonly context = input('');
}
