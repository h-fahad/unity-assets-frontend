"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/store/useUserStore';
import { User, Menu, X, Home, Package, Settings } from 'lucide-react';

export default function Header() {
  const { user, logout } = useUserStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Determine where the account link should go
  const accountHref = user?.role === "ADMIN" ? "/admin" : "/account";

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 mb-6 sm:mb-8">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex-shrink-0 text-xl sm:text-2xl font-bold text-gray-900 hover:text-indigo-600 transition-colors"
            onClick={closeMenu}
          >
            Unity<span className="text-indigo-600">Assets</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link 
              href="/packages" 
              className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors"
            >
              <Package className="w-4 h-4" />
              Packages
            </Link>
            {user && (
              <Link 
                href={accountHref} 
                className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors"
              >
                <Settings className="w-4 h-4" />
                Account
              </Link>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link 
                  href={accountHref} 
                  className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  title={user.name || user.email}
                >
                  <User className="w-5 h-5 text-gray-700" />
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  href="/signin" 
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg text-gray-700 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}>
          <div className="py-4 space-y-3 border-t border-gray-100 bg-white">
            {/* Mobile Navigation Links */}
            <Link 
              href="/" 
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition-colors"
              onClick={closeMenu}
            >
              <Home className="w-5 h-5" />
              Home
            </Link>
            <Link 
              href="/packages" 
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition-colors"
              onClick={closeMenu}
            >
              <Package className="w-5 h-5" />
              Packages
            </Link>
            {user && (
              <Link 
                href={accountHref} 
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition-colors"
                onClick={closeMenu}
              >
                <Settings className="w-5 h-5" />
                Account
              </Link>
            )}

            {/* Mobile Auth */}
            <div className="pt-3 border-t border-gray-100">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600">
                    <User className="w-5 h-5" />
                    <span className="truncate">{user.name || user.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-medium transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link 
                    href="/signin" 
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition-colors"
                    onClick={closeMenu}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="w-full flex items-center gap-3 px-4 py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors shadow-sm"
                    onClick={closeMenu}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
} 