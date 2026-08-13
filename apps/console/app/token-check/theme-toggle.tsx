'use client';

import { useState } from 'react';

/**
 * Proves the [data-theme="dark"] CSS-variable substitution rule end to end
 * (AC4) — temporary/internal only, not a real product surface. Story 1.3
 * (Console Shell) owns the real theme control.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <button
      type="button"
      className="type-label border-border text-foreground ps-control-pad-inline pe-control-pad-inline pt-control-pad-block pb-control-pad-block border"
      onClick={() => {
        const next = theme === 'light' ? 'dark' : 'light';
        setTheme(next);
        document.documentElement.dataset.theme = next;
      }}
    >
      theme: {theme}
    </button>
  );
}
