'use client';

import { ThemeProvider as NextThemes } from 'next-themes';
import { THEME_STORAGE_KEY } from '@/lib/theme';

/**
 * The base theme, from next-themes.
 *
 * `attribute="class"` because the stylesheet's dark variant is `.dark`, and
 * `enableSystem` because the honest default for a visitor who has expressed no
 * preference here is the one they already expressed to their operating system.
 *
 * `disableTransitionOnChange` suppresses transitions for the moment the class
 * flips. Without it, every element with a colour transition animates its own
 * way across the switch and the page dissolves rather than changes.
 */
export function ThemeProvider({ children }: { readonly children: React.ReactNode }) {
  return (
    <NextThemes
      attribute="class"
      defaultTheme="dark"
      // The Nov23 v10 reference is a single dark theme for every route; a
      // light system preference must not flip tokens under the dark shell.
      forcedTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      storageKey={THEME_STORAGE_KEY}
    >
      {children}
    </NextThemes>
  );
}
