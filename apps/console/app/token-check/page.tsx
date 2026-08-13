import { ThemeToggle } from './theme-toggle';

/**
 * Temporary/internal route proving end-to-end token consumption (AC1, AC3,
 * AC4) — not a real product surface. Console Shell (Story 1.3) owns the
 * real UI.
 */
export default function TokenCheckPage() {
  return (
    <main className="ps-page-margin pe-page-margin pt-page-margin pb-page-margin">
      <h1 className="type-display text-foreground">Lawha</h1>
      <p className="type-body text-muted-foreground">Console typography and colour tokens, wired end to end.</p>

      <button
        type="button"
        className="type-label bg-electric text-electric-foreground ps-control-pad-inline pe-control-pad-inline pt-control-pad-block pb-control-pad-block rounded mt-gutter"
      >
        button-primary
      </button>

      <div className="mt-gutter">
        <ThemeToggle />
      </div>
    </main>
  );
}
