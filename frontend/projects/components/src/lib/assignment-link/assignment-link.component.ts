import { Component, input } from '@angular/core';
@Component({
  selector: 'qbc-assignment-link',
  templateUrl: './assignment-link.component.html',
  styleUrl: './assignment-link.component.scss',
})
export class AssignmentLinkComponent {
  readonly storyKey = input.required<string>();
  readonly label = input.required<string>();
}
