'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navigation */}
      <nav style={{
        borderBottom: '1px solid hsl(var(--color-border))',
        background: 'white'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '64px'
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>🔐 EncryptoVault</h1>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link href="/login">
              <button style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                background: 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }} onMouseOver={(e) => e.currentTarget.style.background = 'hsl(0 0% 96%)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                Login
              </button>
            </Link>
            <Link href="/register">
              <button style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                background: 'hsl(var(--color-accent))',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }} onMouseOver={(e) => e.currentTarget.style.background = 'hsl(0 0% 10%)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'hsl(var(--color-accent))'}>
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '80px 24px 64px',
        textAlign: 'center'
      }}>
        <div className="animate-fade-in">
          <h1 style={{
            fontSize: 'clamp(40px, 6vw, 60px)',
            fontWeight: 'bold',
            marginBottom: '24px',
            lineHeight: '1.2'
          }}>
            Secure Cloud Storage
            <br />
            <span style={{ color: 'hsl(var(--color-text-secondary))' }}>Made Simple</span>
          </h1>
          <p style={{
            fontSize: '20px',
            color: 'hsl(var(--color-text-secondary))',
            marginBottom: '40px',
            maxWidth: '672px',
            margin: '0 auto 40px'
          }}>
            Store, manage, and share your files with military-grade encryption.
            Your data, secured and accessible from anywhere.
          </p>
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link href="/register">
              <button style={{
                padding: '16px 32px',
                background: 'hsl(var(--color-accent))',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                fontSize: '18px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}>
                Start Free Trial
              </button>
            </Link>
            <Link href="/login">
              <button style={{
                padding: '16px 32px',
                background: 'white',
                color: 'hsl(var(--color-accent))',
                border: '1px solid hsl(var(--color-border))',
                borderRadius: '8px',
                fontWeight: '500',
                fontSize: '18px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '80px 24px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{
            fontSize: 'clamp(30px, 4vw, 40px)',
            fontWeight: 'bold',
            marginBottom: '16px'
          }}>
            Why Choose EncryptoVault?
          </h2>
          <p style={{
            fontSize: '18px',
            color: 'hsl(var(--color-text-secondary))'
          }}>
            Enterprise-grade security meets user-friendly design
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px'
        }}>
          {/* Feature Cards */}
          {[
            {
              icon: '🔒',
              title: 'End-to-End Encryption',
              description: 'Your files are encrypted before upload and remain secure at rest. Only you have access to your data.'
            },
            {
              icon: '☁️',
              title: 'Cloud Powered',
              description: 'Built on AWS S3 infrastructure for reliability and scalability. Access your files from anywhere.'
            },
            {
              icon: '⚡',
              title: 'Lightning Fast',
              description: 'Optimized upload and download speeds with CDN distribution. Your files, instantly available.'
            },
            {
              icon: '📱',
              title: 'Universal Access',
              description: 'Seamless experience across all devices. Desktop, tablet, or mobile.'
            },
            {
              icon: '🔗',
              title: 'Easy Sharing',
              description: 'Generate secure sharing links with expiration dates and access controls.'
            },
            {
              icon: '💼',
              title: 'Professional Ready',
              description: 'Perfect for individuals and teams. Organize with folders and tags.'
            }
          ].map((feature, index) => (
            <div key={index} className="clean-card" style={{ padding: '32px' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>{feature.icon}</div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '12px'
              }}>
                {feature.title}
              </h3>
              <p style={{ color: 'hsl(var(--color-text-secondary))' }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: 'hsl(var(--color-accent))',
        color: 'white',
        padding: '80px 24px'
      }}>
        <div style={{
          maxWidth: '896px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: 'clamp(30px, 4vw, 40px)',
            fontWeight: 'bold',
            marginBottom: '24px'
          }}>
            Ready to Secure Your Files?
          </h2>
          <p style={{
            fontSize: '20px',
            color: 'hsl(0 0% 80%)',
            marginBottom: '32px'
          }}>
            Join thousands of users who trust EncryptoVault with their data.
          </p>
          <Link href="/register">
            <button style={{
              padding: '16px 32px',
              background: 'white',
              color: 'hsl(var(--color-accent))',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '500',
              fontSize: '18px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              Get Started - It's Free
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid hsl(var(--color-border))',
        padding: '48px 24px',
        background: 'white',
        textAlign: 'center',
        color: 'hsl(var(--color-text-secondary))'
      }}>
        <p>© 2026 EncryptoVault. All rights reserved.</p>
        <p style={{ marginTop: '8px', fontSize: '14px' }}>Secure. Private. Reliable.</p>
      </footer>
    </div>
  );
}