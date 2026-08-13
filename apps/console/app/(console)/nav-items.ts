import type { MessageKey } from '@lawha/i18n';

export interface NavItem {
  href: string;
  labelKey: MessageKey;
}

// surface-inventory.md's Console table / EXPERIENCE.md's Information
// Architecture table, filtered to the 7 nav-reachable surfaces in IA order.
// "Pair a screen" and "Playlist editor" are deliberately absent — both are
// reached only from within a flow, never from navigation
// (surface-inventory.md line 27).
export const NAV_ITEMS: readonly NavItem[] = [
  { href: '/screens', labelKey: 'shell.nav.screens' },
  { href: '/media', labelKey: 'shell.nav.media' },
  { href: '/playlists', labelKey: 'shell.nav.playlists' },
  { href: '/schedules', labelKey: 'shell.nav.schedules' },
  { href: '/branches', labelKey: 'shell.nav.branches' },
  { href: '/billing', labelKey: 'shell.nav.billing' },
  { href: '/settings', labelKey: 'shell.nav.settings' },
];
