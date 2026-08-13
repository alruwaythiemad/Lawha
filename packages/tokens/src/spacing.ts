// Verbatim transcription of DESIGN.md § spacing.
// `section-gap` is 0px intentionally (full-bleed, edge-to-edge regions
// separated by a rule) — do not "fix" this as if it were an oversight.

export const spacing = {
  'page-margin': '20px',
  'page-margin-narrow': '16px',
  gutter: '16px',
  'row-pad-block': '16px',
  'row-pad-inline': '20px',
  'control-pad-block': '12px',
  'control-pad-inline': '16px',
  'tag-pad-block': '4px',
  'tag-pad-inline': '8px',
  'section-gap': '0px',
  rule: '1px',
  'nav-rail': '192px',
} as const;

export type SpacingName = keyof typeof spacing;
