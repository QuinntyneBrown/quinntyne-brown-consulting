import { Component, computed, input } from '@angular/core';
import { IconName } from './icon-name';

@Component({ selector: 'qbc-icon', templateUrl: './icon.component.html', styleUrl: './icon.component.scss' })
export class IconComponent {
  readonly name = input<IconName>('board');
  readonly size = input(16);
  readonly label = input<string | null>(null);
  readonly glyph = computed(() => GLYPHS[this.name()]);
  readonly boxSize = computed(() => Math.max(this.size(), 18));
}

const GLYPHS: Readonly<Record<IconName, string>> = {
  board: '▦', backlog: '≡', initiatives: '⌘', assistants: '◎', menu: '☰', add: '＋', close: '×',
  search: '⌕', 'arrow-left': '←', 'arrow-right': '→', more: '•••', alert: '!', empty: '◇', initiative: '↗'
};
