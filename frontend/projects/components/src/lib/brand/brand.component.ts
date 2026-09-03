import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({ selector: 'qbc-brand', imports: [RouterLink], templateUrl: './brand.component.html', styleUrl: './brand.component.scss' })
export class BrandComponent {
  readonly mark = input('Q');
  readonly name = input('QBC');
  readonly tagline = input('Workboard');
  readonly href = input('/board');
}
