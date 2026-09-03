import { Component, booleanAttribute, input } from '@angular/core';
import { AvatarComponent } from '../avatar/avatar.component';
import { PointsComponent } from '../points/points.component';
@Component({ selector: 'qbc-story-card', imports: [AvatarComponent, PointsComponent], templateUrl: './story-card.component.html', styleUrl: './story-card.component.scss', host: { class: 'story-card', '[attr.draggable]': 'draggableCard() ? true : null', '[class.dragging]': 'dragging()' } })
export class StoryCardComponent {
  readonly storyKey = input('QBC-000'); readonly title = input('Untitled story'); readonly context = input(''); readonly points = input<number | null>(null); readonly owner = input('');
  readonly draggableCard = input(false, { transform: booleanAttribute }); readonly dragging = input(false, { transform: booleanAttribute });
}
