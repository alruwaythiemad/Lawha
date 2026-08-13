import { format } from '@lawha/i18n';
import { resolveLocale } from '../../locale-cookie';
import { resolveSignedInWorkspace } from '../../../lib/workspace-bootstrap';

// Real content is Story 6.1's job — this story only builds a thin route so
// the shell nav has somewhere to point (scope boundary, epics.md).
export default async function SchedulesPage() {
  const workspace = await resolveSignedInWorkspace();
  const locale = await resolveLocale(workspace.language);
  return <h1 className="type-display text-foreground">{format(locale, 'shell.nav.schedules')}</h1>;
}
