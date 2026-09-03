import { Component, input } from '@angular/core';
@Component({
  selector: 'qbc-toast',
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent {
  readonly tone = input<'default' | 'error'>('default');
}
