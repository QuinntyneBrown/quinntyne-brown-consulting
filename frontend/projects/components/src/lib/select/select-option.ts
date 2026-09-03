export type SelectValue = string | number | boolean | null;
export interface SelectOption<T extends SelectValue = SelectValue> { readonly value: T; readonly label: string; readonly disabled?: boolean; }
export interface SelectOptionGroup<T extends SelectValue = SelectValue> { readonly label: string; readonly options: readonly SelectOption<T>[]; }
export type SelectItem<T extends SelectValue = SelectValue> = SelectOption<T> | SelectOptionGroup<T>;
