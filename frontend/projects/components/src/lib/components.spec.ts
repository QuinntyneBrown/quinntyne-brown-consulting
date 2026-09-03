import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from './button/button.component';
import { DialogComponent } from './dialog/dialog.component';
import { ProgressComponent } from './progress/progress.component';
import { SelectOption } from './select/select-option';
import { SelectComponent } from './select/select.component';

@Component({
  imports: [ReactiveFormsModule, SelectComponent],
  template: '<qbc-select label="Status" [options]="options" [formControl]="control" />'
})
class SelectHostComponent {
  readonly control = new FormControl('planned', { nonNullable: true });
  readonly options: readonly SelectOption<string>[] = [
    { value: 'planned', label: 'Planned' },
    { value: 'active', label: 'Active' }
  ];
}

describe('QBC component contracts', () => {
  it('maps button inputs to the native control', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.componentRef.setInput('variant', 'secondary');
    fixture.componentRef.setInput('disabled', true);
    fixture.componentRef.setInput('type', 'submit');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.type).toBe('submit');
    expect(button.classList).toContain('secondary');
  });

  it('participates in reactive forms with native option values', async () => {
    const fixture = TestBed.createComponent(SelectHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(select.value).toBe('planned');
    expect(Array.from(select.options).map(option => option.value)).toEqual(['planned', 'active']);

    select.value = 'active';
    select.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.control.value).toBe('active');
  });

  it('clamps progress values and exposes the accessible value', () => {
    const fixture = TestBed.createComponent(ProgressComponent);
    fixture.componentRef.setInput('value', 140);
    fixture.componentRef.setInput('label', 'Completion');
    fixture.detectChanges();

    const meter = fixture.nativeElement.querySelector('[role="progressbar"]') as HTMLElement;
    expect(meter.getAttribute('aria-label')).toBe('Completion');
    expect(meter.getAttribute('aria-valuenow')).toBe('100');
  });

  it('opens and closes dialogs through the imperative API', () => {
    const fixture: ComponentFixture<DialogComponent> = TestBed.createComponent(DialogComponent);
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    dialog.showModal = () => dialog.setAttribute('open', '');
    dialog.close = () => dialog.removeAttribute('open');

    fixture.componentInstance.open();
    expect(dialog.open).toBe(true);
    expect(fixture.componentInstance.isOpen()).toBe(true);

    fixture.componentInstance.close();
    expect(dialog.open).toBe(false);
    expect(fixture.componentInstance.isOpen()).toBe(false);
  });
});
