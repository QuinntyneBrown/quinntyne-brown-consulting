import { Component, input } from '@angular/core';
import { Availability, AvailabilityComponent } from '../availability/availability.component';
import { AvatarComponent } from '../avatar/avatar.component';
import { TagComponent } from '../tag/tag.component';
@Component({ selector: 'qbc-assistant-card', imports: [AvailabilityComponent, AvatarComponent, TagComponent], templateUrl: './assistant-card.component.html', styleUrl: './assistant-card.component.scss', host: { class: 'assistant-card' } })
export class AssistantCardComponent {
  readonly name = input('Unnamed assistant'); readonly role = input(''); readonly availability = input<Availability>('available');
  readonly specialties = input<readonly string[]>([]); readonly storyCount = input(0); readonly openTaskCount = input(0);
}
