/**
 * Temporary/internal smoke test proving end-to-end token consumption in
 * the player bundle (AC1, AC3) — not a real product surface. The Player
 * Display Surface (Epic 3) owns the real UI.
 */
export function App() {
  return (
    <div
      style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-foreground)' }}
    >
      <p className="type-player-headline">Lawha</p>
      <p className="type-player-body">Player typography and colour tokens, wired end to end.</p>
    </div>
  );
}
