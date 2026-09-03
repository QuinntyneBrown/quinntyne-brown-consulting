import { Component, input } from '@angular/core';
@Component({ selector: 'qbc-task-item', templateUrl: './task-item.component.html', styleUrl: './task-item.component.scss' })
export class TaskItemComponent { readonly done = input(false); }
