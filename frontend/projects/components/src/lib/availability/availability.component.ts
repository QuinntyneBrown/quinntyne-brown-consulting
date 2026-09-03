import { Component, input } from '@angular/core';
export type Availability = 'available' | 'limited' | 'unavailable';
@Component({ selector: 'qbc-availability', templateUrl: './availability.component.html', styleUrl: './availability.component.scss' })
export class AvailabilityComponent { readonly status = input<Availability>('available'); }
