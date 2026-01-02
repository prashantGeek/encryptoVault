'use client';

import Link from 'next/link';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav
      style={{
        borderBottom: '1px solid hsl(var(--color-border))',
        background: 'white',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '64px',
        }}
      >
        <Link href="/dashboard">
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', cursor: 'pointer' }}>
            🔐 EncryptoVault
          </h1>
        </Link>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '14px', color: 'hsl(var(--color-text-secondary))' }}>
              {user.name}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                background: 'hsl(var(--color-accent))',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}