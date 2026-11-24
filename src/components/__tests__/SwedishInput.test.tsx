import { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SwedishInput } from '../SwedishInput';

afterEach(() => {
  cleanup();
});

function ControlledHarness({
  initial = '',
  onSubmit = () => {},
}: {
  initial?: string;
  onSubmit?: () => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <SwedishInput
      value={value}
      onChange={setValue}
      onSubmit={onSubmit}
      label="Swedish answer"
      id="sv-test-input"
    />
  );
}

describe('SwedishInput', () => {
  it('renders mobile-safe 16px input attributes and inline diacritic strip', () => {
    render(<ControlledHarness />);
    const input = screen.getByLabelText('Swedish answer') as HTMLInputElement;

    expect(input.getAttribute('autocorrect')).toBe('off');
    expect(input.getAttribute('autocapitalize')).toBe('off');
    expect(input.getAttribute('spellcheck')).toBe('false');
    expect(input.getAttribute('lang')).toBe('sv');
    expect(input.getAttribute('enterkeyhint')).toBe('done');
    expect(input.className).toContain('text-[16px]');
    expect(input.className).toContain('min-h-[48px]');

    expect(screen.getByRole('button', { name: 'Insert å' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Insert ä' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Insert ö' })).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Toggle uppercase Swedish letters' })
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Check ↵' })).toBeTruthy();
  });

  it('inserts å, ä, ö at current caret position without blurring the active input', () => {
    render(<ControlledHarness initial="sprk" />);
    const input = screen.getByLabelText('Swedish answer') as HTMLInputElement;

    input.focus();
    expect(document.activeElement).toBe(input);

    // Position cursor between "spr" and "k"
    input.setSelectionRange(3, 3);

    const aRingBtn = screen.getByRole('button', { name: 'Insert å' });
    const mouseDownNotCanceled = fireEvent.mouseDown(aRingBtn);
    expect(mouseDownNotCanceled).toBe(false); // preventDefault() was called

    // Also verify pointerDown prevents default when PointerEvent exists
    const pointerEvt = new Event('pointerdown', {
      bubbles: true,
      cancelable: true,
    });
    aRingBtn.dispatchEvent(pointerEvt);
    expect(pointerEvt.defaultPrevented).toBe(true);

    fireEvent.click(aRingBtn);

    expect(input.value).toBe('språk');
    expect(document.activeElement).toBe(input);
    expect(input.selectionStart).toBe(4);
    expect(input.selectionEnd).toBe(4);
  });

  it('toggles uppercase Å/Ä/Ö via shift button without blurring input and submits on Enter/Check', () => {
    const onSubmit = vi.fn();
    render(<ControlledHarness initial="" onSubmit={onSubmit} />);
    const input = screen.getByLabelText('Swedish answer') as HTMLInputElement;
    input.focus();

    const shiftBtn = screen.getByRole('button', {
      name: 'Toggle uppercase Swedish letters',
    });
    expect(fireEvent.mouseDown(shiftBtn)).toBe(false);
    fireEvent.click(shiftBtn);
    expect(document.activeElement).toBe(input);

    const upperO = screen.getByRole('button', { name: 'Insert Ö' });
    fireEvent.click(upperO);
    expect(input.value).toBe('Ö');
    expect(document.activeElement).toBe(input);

    const checkBtn = screen.getByRole('button', { name: 'Check ↵' });
    expect(fireEvent.mouseDown(checkBtn)).toBe(false);
    fireEvent.click(checkBtn);
    expect(onSubmit).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });
});
