'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Monitor, Moon, Palette, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/cn';
import { POINT_PRESETS, applyPoint, normalisePoint, readPoint } from '@/lib/theme';

const DEFAULT_FIELD = '#d36c45';

/**
 * The exact declaration globals.css guards its `[data-point]` block with.
 *
 * A browser that cannot parse it keeps the product's own palette, which is a
 * fine outcome — but offering a colour picker that silently does nothing is
 * not, so the swatches say so instead.
 */
const POINT_SUPPORTED = 'color: oklch(from red 0.5 clamp(0.02, c * 0.5, 0.09) h)';

const BASES = [
  { value: 'system', label: '시스템', Icon: Monitor },
  { value: 'light', label: '라이트', Icon: Sun },
  { value: 'dark', label: '다크', Icon: Moon },
] as const;

/**
 * The display settings, as a panel.
 *
 * Two rows, because there are exactly two things to decide and they are not
 * the same kind of decision: the base is a choice between three states, so it
 * is a segmented control; the point colour is a choice from a continuum, so it
 * is swatches with a way in for a colour that is not among them.
 *
 * Every control applies on click. There is no save button, because the page
 * behind the panel *is* the preview — a confirmation step would only stand
 * between the reader and the thing they are trying to look at.
 */
export function ThemePanel({ className }: { readonly className?: string }) {
  const { theme, setTheme } = useTheme();
  const [point, setPoint] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [supported, setSupported] = useState(true);

  // Both preferences live in this browser, so neither is knowable while the
  // server renders. Reading them in an effect and holding the controls
  // un-selected until then keeps the server's HTML and the first client render
  // identical, which is what React checks.
  useEffect(() => {
    setPoint(readPoint());
    setMounted(true);
    // Assumed true until proven otherwise, so the server's markup and the
    // first client render agree.
    setSupported(typeof CSS !== 'undefined' && CSS.supports(POINT_SUPPORTED));
  }, []);

  function choose(hex: string | null): void {
    applyPoint(hex);
    setPoint(hex === null ? null : normalisePoint(hex));
  }

  return (
    <div className={cn('grid gap-5', className)}>
      <fieldset className="grid gap-2">
        <legend className="eyebrow mb-2">화면</legend>
        <div className="grid grid-cols-3 gap-1 rounded-[12px] bg-muted p-1">
          {BASES.map(({ value, label, Icon }) => {
            const active = mounted && theme === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                aria-pressed={active}
                className={cn(
                  'flex min-h-10 flex-col items-center justify-center gap-1 rounded-[9px] text-[11px] font-bold transition-colors',
                  active
                    ? 'bg-card text-foreground shadow-plate'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="eyebrow mb-2">포인트 색</legend>
        <div className="flex flex-wrap items-center gap-2">
          {POINT_PRESETS.map((preset) => {
            const active = mounted && point === preset.hex;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => choose(preset.hex)}
                aria-pressed={active}
                title={preset.label}
                className={cn(
                  'size-9 rounded-full border-2 transition-transform hover:-translate-y-0.5',
                  active ? 'border-foreground' : 'border-transparent',
                )}
                style={{ background: preset.hex }}
              >
                <span className="sr-only">{preset.label}</span>
              </button>
            );
          })}
          {/* Restoring the default is a choice too, and it needs to be as
              reachable as the six that changed things. */}
          <Button
            type="button"
            variant="ghost"
            onClick={() => choose(null)}
            className={cn(
              'h-9 px-2 text-xs font-bold',
              mounted && point === null ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            기본
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="color"
            aria-label="포인트 색 고르기"
            value={point ?? DEFAULT_FIELD}
            onChange={(event) => choose(event.target.value)}
            className="size-10 shrink-0 cursor-pointer rounded-[10px] border bg-card p-1"
          />
          <input
            type="text"
            inputMode="text"
            spellCheck={false}
            aria-label="포인트 색 코드"
            placeholder={DEFAULT_FIELD}
            value={point ?? ''}
            // Typed a character at a time, so most keystrokes are not yet a
            // colour. Only the ones that parse are applied; the rest are held
            // in the field so the reader can keep typing.
            onChange={(event) => {
              const typed = event.target.value;
              const parsed = normalisePoint(typed);
              if (parsed) choose(parsed);
              else setPoint(typed === '' ? null : typed);
            }}
            className="h-10 w-full rounded-[10px] border bg-card px-3 font-mono text-sm uppercase"
          />
        </div>

        <p className="text-xs leading-[1.6] text-muted-foreground">
          {supported
            ? '바탕과 글자색은 바뀌지 않아요. 어떤 색을 골라도 글은 읽을 수 있습니다.'
            : '이 브라우저는 포인트 색을 지원하지 않아 기본 색으로 보입니다. 화면 밝기 설정은 그대로 쓸 수 있어요.'}
        </p>
      </fieldset>
    </div>
  );
}

/** The same panel behind one button, for the masthead. */
export function ThemeMenu() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-11 text-muted-foreground"
          aria-label="화면 설정"
        >
          <Palette />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <ThemePanel />
      </PopoverContent>
    </Popover>
  );
}
