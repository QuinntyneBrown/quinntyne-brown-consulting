import { Component, input } from '@angular/core';
@Component({ selector: 'qbc-initiative-card', templateUrl: './initiative-card.component.html', styleUrl: './initiative-card.component.scss', host: { class: 'initiative-card' } })
export class InitiativeCardComponent { readonly title = input('Untitled initiative'); readonly description = input(''); readonly summary = input(''); }
