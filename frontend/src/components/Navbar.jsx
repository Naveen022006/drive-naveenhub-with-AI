/**
 * Navbar — Sticky top navigation bar.
 * Clean layout: Logo left, user info + logout right.
 */

import { LogOut, HardDrive, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <nav className="glass-strong sticky top-0 z-50 w-full">
      <div className="w-full max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              }}
            >
              <HardDrive size={18} color="white" />
            </div>
            <div className="leading-tight">
              <h1 className="text-base font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
                Naveen<span className="gradient-text">Hub</span>
              </h1>
              <p className="text-[11px] font-medium" style={{ color: 'var(--color-text-dim)' }}>
                Drive Assistant
              </p>
            </div>
          </div>

          {/* ── Desktop: User + Logout ── */}
          <div className="hidden md:flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                  style={{ border: '2px solid var(--color-border)' }}
                  referrerPolicy="no-referrer"
                />
                <div className="leading-tight">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                    {user.name}
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    {user.email}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 h-9 rounded-lg text-sm font-medium cursor-pointer"
              style={{
                background: 'var(--color-danger-bg)',
                color: 'var(--color-danger)',
                border: 'none',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-danger-bg)';
              }}
              id="logout-button"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>

          {/* ── Mobile Menu Button ── */}
          <button
            className="md:hidden p-2 rounded-lg cursor-pointer"
            style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none' }}
            onClick={() => setMenuOpen(!menuOpen)}
            id="mobile-menu-button"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {menuOpen && (
        <div
          className="md:hidden px-6 pb-4 animate-fade-in"
          style={{ borderTop: '1px solid var(--color-border-light)' }}
        >
          {user && (
            <div className="flex items-center gap-3 py-4">
              <img
                src={user.picture}
                alt={user.name}
                className="w-10 h-10 rounded-full"
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  {user.name}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {user.email}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-medium cursor-pointer"
            style={{
              background: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              border: 'none',
            }}
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
