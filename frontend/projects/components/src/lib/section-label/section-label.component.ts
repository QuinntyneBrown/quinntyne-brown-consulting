import { Component, input } from '@angular/core';
@Component({ selector: 'qbc-section-label', templateUrl: './section-label.component.html', styleUrl: './section-label.component.scss' })
export class SectionLabelComponent { readonly heading = input('Section'); readonly hint = input(''); }
