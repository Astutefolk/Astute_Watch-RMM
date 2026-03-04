'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/lib/theme';
import clsx from 'clsx';

export function Navigation() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'Devices', href: '/devices', icon: '💻' },
    { label: 'Alerts', href: '/alerts', icon: '⚠️' },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-dark backdrop-blur-glass border-b border-primary-500/10 dark:border-primary-500/20 shadow-glow-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 font-bold text-2xl group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-xl flex items-center justify-center text-white text-xl shadow-glow-primary group-hover:shadow-glow-primary/50 transition-all duration-300 transform group-hover:scale-110">
              🛡️
            </div>
            <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent hidden sm:inline">DATTO RMM</span>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2',
                    'text-slate-700 dark:text-slate-300',
                    'hover:bg-primary-500/20 dark:hover:bg-primary-500/10 hover:text-primary-600 dark:hover:text-primary-400',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900'
                  )}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side menu */}
          <div className="flex items-center gap-4">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={clsx(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                'bg-primary-500/20 dark:bg-primary-500/10 backdrop-blur-sm',
                'text-primary-600 dark:text-primary-400',
                'hover:bg-primary-500/30 dark:hover:bg-primary-500/20',
                'transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500',
                'border border-primary-500/20 dark:border-primary-500/10',
                'hover:shadow-glow-primary/30 hover:scale-110 active:scale-95'
              )}
              aria-label="Toggle theme"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {user && (
              <>
                {/* Mobile menu button */}
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className={clsx(
                    'md:hidden w-10 h-10 rounded-lg flex items-center justify-center',
                    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
                    'hover:bg-slate-200 dark:hover:bg-slate-700'
                  )}
                >
                  ☰
                </button>

                {/* User menu */}
                <div className="hidden md:flex items-center gap-4 pl-4 border-l border-slate-200 dark:border-slate-700">
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{user.email}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className={clsx(
                      'px-4 py-2 rounded-lg font-medium transition-colors',
                      'bg-danger-100 dark:bg-danger-900/30',
                      'text-danger-700 dark:text-danger-300',
                      'hover:bg-danger-200 dark:hover:bg-danger-900/50'
                    )}
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {user && isOpen && (
          <div className="md:hidden pb-4 border-t border-slate-200 dark:border-slate-700">
            <div className="pt-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'block px-4 py-2 rounded-lg font-medium transition-colors',
                    'text-slate-700 dark:text-slate-300',
                    'hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    {item.label}
                  </span>
                </Link>
              ))}
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className={clsx(
                  'w-full text-left px-4 py-2 rounded-lg font-medium transition-colors',
                  'text-danger-700 dark:text-danger-300',
                  'hover:bg-danger-100 dark:hover:bg-danger-900/30'
                )}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
