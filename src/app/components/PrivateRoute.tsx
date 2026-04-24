'use client';

// This component is no longer needed with Next.js App Router
// Authentication is handled in (auth)/layout.tsx
// Keeping this file for backward compatibility

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  return children;
}

export default PrivateRoute;
