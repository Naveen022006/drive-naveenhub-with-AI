/**
 * LoginPage — Full-screen login page with Google OAuth sign-in.
 * Features glassmorphism card, animated gradient background, and branding.
 */

import { HardDrive, LogIn, Shield, Zap, Brain } from 'lucide-react';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <LoadingSpinner size="lg" text="Checking session..." />
      </div>
    );
  }

  const features = [
    { icon: HardDrive, label: 'Full Drive Access', desc: 'Browse, upload & download files' },
    { icon: Shield, label: 'Secure OAuth 2.0', desc: 'Your credentials stay with Google' },
    { icon: Brain, label: 'AI Assistant', desc: 'JARVIS-style file management' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 sm:p-8 relative overflow-hidden">
      {/* Animated Background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 30%, #0f172a 60%, #0c4a6e 100%)',
        }}
      />

      {/* Floating orbs for visual depth */}
      <div
        className="absolute w-96 h-96 rounded-full animate-float"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          top: '-10%',
          right: '-10%',
          animationDuration: '6s',
        }}
      />
      <div
        className="absolute w-80 h-80 rounded-full animate-float"
        style={{
          background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
          bottom: '-5%',
          left: '-5%',
          animationDuration: '8s',
          animationDelay: '2s',
        }}
      />

      {/* Login Card */}
      <div
        className="relative z-10 w-full max-w-md glass-strong rounded-2xl animate-fade-in-up"
        style={{
          boxShadow: '0 25px 60px -12px rgba(0,0,0,0.5)',
          padding: '48px 40px',
        }}
      >
        {/* Logo */}
        <div className="text-center" style={{ marginBottom: '40px' }}>
          <div
            className="inline-flex rounded-2xl"
            style={{
              padding: '16px',
              marginBottom: '16px',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              boxShadow: '0 0 40px rgba(99,102,241,0.3)',
            }}
          >
            <HardDrive size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold" style={{ marginBottom: '4px' }}>
            Naveen<span className="gradient-text">Hub</span>
          </h1>
          <p className="text-base" style={{ color: 'var(--color-text-muted)' }}>
            Drive Assistant
          </p>
        </div>

        {/* Features List */}
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
          {features.map(({ icon: Icon, label, desc }, i) => (
            <div
              key={i}
              className="flex items-center"
              style={{
                gap: '16px',
                padding: '14px 16px',
                borderRadius: '12px',
                background: 'rgba(99,102,241,0.06)',
                border: '1px solid var(--color-glass-border)',
              }}
            >
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(99,102,241,0.15)',
                }}
              >
                <Icon size={18} style={{ color: 'var(--color-primary-light)' }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                  {label}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Sign In Button */}
        <button
          onClick={login}
          className="w-full flex items-center justify-center text-white font-semibold text-base cursor-pointer"
          style={{
            gap: '12px',
            padding: '14px 0',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
            boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
            transition: 'var(--transition)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(99,102,241,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(99,102,241,0.3)';
          }}
          id="google-signin-button"
        >
          {/* Google "G" SVG */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#fff"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#fff"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              opacity="0.9"
            />
            <path
              fill="#fff"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              opacity="0.7"
            />
            <path
              fill="#fff"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              opacity="0.8"
            />
          </svg>
          Sign in with Google
        </button>

        {/* Footer */}
        <p className="text-xs text-center" style={{ marginTop: '24px', color: 'var(--color-text-muted)' }}>
          By signing in, you authorize NaveenHub to access your Google Drive.
          <br />
          We never store your password.
        </p>
      </div>
    </div>
  );
}
