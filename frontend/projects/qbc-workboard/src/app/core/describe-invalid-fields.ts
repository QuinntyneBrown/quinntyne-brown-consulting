import { FormArray, FormGroup } from '@angular/forms';

/**
 * Names every field a form rejected. A save the browser cannot send must still say why, so the
 * message lists each invalid field rather than leaving the form silently unchanged.
 *
 * Labels are keyed by control name. A control inside a form array is keyed `array.control` and is
 * reported with its position, matching the accessible name the row carries.
 */
export function describeInvalidFields(
  form: FormGroup,
  labels: Readonly<Record<string, string>>,
): string {
  const fields: string[] = [];
  for (const [name, control] of Object.entries(form.controls)) {
    if (control instanceof FormArray) {
      control.controls.forEach((entry, index) => {
        if (!(entry instanceof FormGroup)) return;
        for (const [field, item] of Object.entries(entry.controls)) {
          if (!item.invalid) continue;
          const row = labels[name] ?? name;
          fields.push(`${row} ${index + 1} ${labels[`${name}.${field}`] ?? field}`);
        }
      });
    } else if (control.invalid) {
      fields.push(labels[name] ?? name);
    }
  }
  return fields.length === 0 ? '' : `These fields need a value: ${fields.join(', ')}.`;
}
