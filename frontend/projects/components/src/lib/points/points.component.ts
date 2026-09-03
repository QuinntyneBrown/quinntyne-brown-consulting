import { Component, computed, input } from '@angular/core';
@Component({ selector: 'qbc-points', templateUrl: './points.component.html', styleUrl: './points.component.scss' })
export class PointsComponent {
  readonly value = input<number | null>(null);
  readonly label = computed(() => this.value() === null ? 'Not estimated' : `${this.value()} story points`);
}
