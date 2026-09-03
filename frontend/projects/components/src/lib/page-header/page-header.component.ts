import { Component, input } from '@angular/core';

@Component({
  selector: 'qbc-page-header',
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
