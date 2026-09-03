import { Component, input } from '@angular/core';
import { CountComponent } from '../count/count.component';
@Component({ selector: 'qbc-board-column', imports: [CountComponent], templateUrl: './board-column.component.html', styleUrl: './board-column.component.scss', host: { class: 'board-column' } })
export class BoardColumnComponent { readonly label = input('To do'); readonly count = input(0); readonly empty = input(false); }
