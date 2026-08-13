// Verbatim transcription of DESIGN.md § rounded.
// `full` is reserved solely for {components.radio} — see components.ts.

export const rounded = {
  DEFAULT: '0px',
  sm: '0px',
  md: '0px',
  lg: '0px',
  xl: '0px',
  full: '9999px',
} as const;

export type RoundedName = keyof typeof rounded;
