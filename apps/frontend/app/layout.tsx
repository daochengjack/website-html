import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { AuthProvider } from '../contexts/auth/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Monorepo Frontend',
  description: 'Next.js placeholder application within the monorepo',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
