import { Component, input } from '@angular/core';
@Component({ selector: 'qbc-sidebar', templateUrl: './sidebar.component.html', styleUrl: './sidebar.component.scss' })
export class SidebarComponent { readonly open = input(false); readonly footer = input('Quinntyne Brown Consulting Inc.'); }
