import { Component, input } from '@angular/core';
@Component({ selector: 'qbc-action-group', templateUrl: './action-group.component.html', styleUrl: './action-group.component.scss' })
export class ActionGroupComponent { readonly align = input<'start' | 'end' | 'between'>('end'); }
