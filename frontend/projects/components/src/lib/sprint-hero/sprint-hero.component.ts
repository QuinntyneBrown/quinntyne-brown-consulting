import { Component, computed, input } from '@angular/core';
import { ProgressComponent } from '../progress/progress.component';
@Component({ selector: 'qbc-sprint-hero', imports: [ProgressComponent], templateUrl: './sprint-hero.component.html', styleUrl: './sprint-hero.component.scss' })
export class SprintHeroComponent {
  readonly eyebrow = input('Current sprint'); readonly goal = input(''); readonly dates = input(''); readonly complete = input(0); readonly total = input(0);
  readonly percentage = computed(() => this.total() === 0 ? 0 : Math.round(this.complete() / this.total() * 100));
}
