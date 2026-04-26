import { redirect } from 'next/navigation';

// The proxy (src/proxy.ts) handles auth-aware redirects.
// Unauthenticated users → /sign-in, authenticated → /dashboard.
// This server-side redirect is the fallback for the root path.
export default function Page() {
  redirect('/sign-in');
}
