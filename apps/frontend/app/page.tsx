'use client';

import Link from 'next/link';
import { Button } from '@repo/ui';

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        fontFamily: 'sans-serif',
        textAlign: 'center'
      }}
    >
      <h1>Welcome to the monorepo frontend</h1>
      <p>Share UI components and types across the entire workspace.</p>
      <Button onClick={() => alert('Shared UI from @repo/ui in action!')}>
        Try shared Button
      </Button>
      <Link href="https://docs.nestjs.com" style={{ color: 'inherit' }}>
        Visit the backend framework docs
      </Link>
    </main>
  );
}
