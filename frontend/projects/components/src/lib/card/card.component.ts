import { Component, booleanAttribute, input } from '@angular/core';
export type CardPadding = 'none' | 'md' | 'lg';
@Component({ selector: 'qbc-card', templateUrl: './card.component.html', styleUrl: './card.component.scss' })
export class CardComponent {
  readonly padding = input<CardPadding>('md');
  readonly interactive = input(false, { transform: booleanAttribute });
  readonly raised = input(false, { transform: booleanAttribute });
}
