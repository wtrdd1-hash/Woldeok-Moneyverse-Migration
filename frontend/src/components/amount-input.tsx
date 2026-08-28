'use client';

import { useState } from 'react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { groupDigits } from '@/lib/money';

/**
 * A WLD amount, grouped while it is typed.
 *
 * `489320192` is a number nobody can read at a glance, and reading it back is
 * exactly what someone does before pressing a button that spends it. So the
 * field shows `489,320,192`.
 *
 * `type="text"` with `inputMode="numeric"`, not `type="number"`: a number
 * input refuses to hold a comma, so the grouping would be dropped on every
 * keystroke. The phone keypad still comes up.
 *
 * The commas are only ever on screen. Every server action reads this through
 * `wholeAmount`, which strips them before the value goes anywhere near an
 * amount — the browser is not trusted to have formatted it correctly, it is
 * only asked to make it readable.
 */
export function AmountInput({
  id,
  name,
  className,
  defaultValue = '',
  required = false,
  placeholder,
  ariaLabel,
}: {
  /** Omitted by the one field that is labelled by `ariaLabel` instead. */
  readonly id?: string;
  readonly name: string;
  /** Sizes the group, for a field that sits inline beside its button. */
  readonly className?: string;
  readonly defaultValue?: string;
  readonly required?: boolean;
  readonly placeholder?: string;
  /** For the one field that has no visible label beside it. */
  readonly ariaLabel?: string;
}) {
  const [value, setValue] = useState(() => format(defaultValue));

  return (
    <InputGroup className={className}>
      <InputGroupInput
        {...(id === undefined ? {} : { id })}
        name={name}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        required={required}
        {...(placeholder === undefined ? {} : { placeholder })}
        {...(ariaLabel === undefined ? {} : { 'aria-label': ariaLabel })}
        value={value}
        onChange={(event) => setValue(format(event.target.value))}
        className="tabular"
      />
      <InputGroupAddon align="inline-end">WLD</InputGroupAddon>
    </InputGroup>
  );
}

/**
 * Keeps the digits and regroups them.
 *
 * Anything that is not a digit is dropped, including the commas this function
 * added a keystroke ago — which is what makes the grouping stable as digits
 * are inserted in the middle. Leading zeros go too, so `007` reads as `7`,
 * but a lone `0` survives because it is a value someone may be part-way
 * through typing.
 */
function format(raw: string): string {
  const digits = raw.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  return digits === '' ? '' : groupDigits(digits);
}
