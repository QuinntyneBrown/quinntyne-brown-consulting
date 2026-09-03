import { Component, input } from '@angular/core';
import { ProgressComponent } from '../progress/progress.component';
@Component({ selector: 'qbc-epic-row', imports: [ProgressComponent], templateUrl: './epic-row.component.html', styleUrl: './epic-row.component.scss', host: { class: 'epic-row' } })
export class EpicRowComponent { readonly title = input('Untitled epic'); readonly summary = input(''); readonly storyCount = input(0); readonly progress = input(0); }
