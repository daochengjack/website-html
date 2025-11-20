import Link from 'next/link';

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
        textAlign: 'center',
      }}
    >
      <h1>Welcome to the monorepo frontend</h1>
      <p>Share UI components and types across the entire workspace.</p>
      <Link
        href="/admin"
        style={{
          color: 'white',
          backgroundColor: '#3b82f6',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.375rem',
          textDecoration: 'none',
          display: 'inline-block',
        }}
      >
        Go to Admin Panel
      </Link>
    </main>
  );
}
