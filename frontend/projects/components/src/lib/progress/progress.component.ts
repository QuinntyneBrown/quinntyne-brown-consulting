import { Component, computed, input } from '@angular/core';
@Component({ selector: 'qbc-progress', templateUrl: './progress.component.html', styleUrl: './progress.component.scss' })
export class ProgressComponent {
  readonly value = input(0); readonly label = input<string | null>(null); readonly mini = input(false);
  readonly safeValue = computed(() => Math.min(100, Math.max(0, Number.isFinite(this.value()) ? this.value() : 0)));
}
