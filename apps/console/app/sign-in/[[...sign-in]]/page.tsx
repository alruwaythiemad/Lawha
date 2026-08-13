import { SignIn } from '@clerk/nextjs';

// Deliberate exception to FR45 (per architecture spine's resolved
// Deferred item): the Clerk hosted surface renders in English in both
// locales, unmirrored. Do not localize or RTL-mirror it here.
export default function SignInPage() {
  return <SignIn />;
}
