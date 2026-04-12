'use client';

import { AuthProvider } from '../context/AuthContext';

/**
 * Thin wrapper that lets the server-component root layout
 * include client-side providers without error.
 */
export default function ClientProviders({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
