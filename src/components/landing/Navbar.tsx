"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-surface-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
              <span className="text-black font-black text-sm">G</span>
            </div>
            <span className="font-bold text-white text-lg">
              Grid<span className="text-primary">Money</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-text-secondary hover:text-white transition-colors text-sm">
              How It Works
            </a>
            <a href="#categories" className="text-text-secondary hover:text-white transition-colors text-sm">
              Categories
            </a>
            <a href="#pricing" className="text-text-secondary hover:text-white transition-colors text-sm">
              Pricing
            </a>
          </div>

          {/* Auth CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login" className="btn-ghost text-sm px-4 py-2">
              Log In
            </Link>
            <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2.5">
              Sign Up Free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden btn-ghost p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-surface border-t border-surface-border py-4 animate-slide-up">
            <div className="flex flex-col gap-3 px-4">
              <a href="#how-it-works" className="nav-item" onClick={() => setMenuOpen(false)}>
                How It Works
              </a>
              <a href="#categories" className="nav-item" onClick={() => setMenuOpen(false)}>
                Categories
              </a>
              <a href="#pricing" className="nav-item" onClick={() => setMenuOpen(false)}>
                Pricing
              </a>
              <div className="border-t border-surface-border pt-3 flex flex-col gap-2">
                <Link href="/auth/login" className="btn-ghost text-center">
                  Log In
                </Link>
                <Link href="/auth/signup" className="btn-primary text-center">
                  Sign Up Free
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
