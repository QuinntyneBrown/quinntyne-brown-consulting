import { Component, computed, input } from '@angular/core';
@Component({ selector: 'qbc-avatar', templateUrl: './avatar.component.html', styleUrl: './avatar.component.scss' })
export class AvatarComponent {
  readonly name = input(''); readonly size = input<'sm' | 'lg'>('sm');
  readonly initials = computed(() => this.name().trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || '—');
  readonly label = computed(() => this.name() ? `Assigned to ${this.name()}` : 'Unassigned');
}
