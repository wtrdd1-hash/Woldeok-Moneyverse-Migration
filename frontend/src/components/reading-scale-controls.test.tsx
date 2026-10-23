import { afterEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { ReadingScaleControls } from './reading-scale-controls';
import { READING_SCALE_KEY } from '@/lib/reading-scale';

const values = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } },
});

afterEach(() => { cleanup(); values.clear(); document.documentElement.style.removeProperty('font-size'); });

describe('reader controls user flow', () => {
  it('provides a keyboard-native choice, announces the applied value and resets it', () => {
    render(<ReadingScaleControls />);
    const option = screen.getByRole('radio', { name: '150%' }) as HTMLInputElement;
    fireEvent.click(option);
    expect(option.checked).toBe(true);
    expect(document.documentElement.style.fontSize).toBe('150%');
    expect(values.get(READING_SCALE_KEY)).toBe('150');
    expect(screen.getByRole('status').textContent).toContain('150%');
    fireEvent.click(screen.getByRole('button', { name: /기본 크기 100%로 초기화/ }));
    expect(document.documentElement.style.fontSize).toBe('');
    expect(values.has(READING_SCALE_KEY)).toBe(false);
  });

  it('restores an existing device choice when the panel mounts', () => {
    values.set(READING_SCALE_KEY, '200');
    render(<ReadingScaleControls />);
    expect((screen.getByRole('radio', { name: '200%' }) as HTMLInputElement).checked).toBe(true);
  });
});
