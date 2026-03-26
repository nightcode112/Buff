"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { List, X } from "@phosphor-icons/react";

const navLinks = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Extension", href: "/extension" },
  { label: "Browse", href: "/browse" },
  { label: "Simulator", href: "/simulator" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Docs", href: "/docs" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || mobileOpen
          ? "bg-background/80 backdrop-blur-2xl border-b border-border/50 shadow-[0_1px_12px_rgba(0,0,0,0.04)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto px-6 lg:px-16 h-16 sm:h-[72px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-sm bg-gold/10 flex items-center justify-center group-hover:bg-gold/15 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gold">
              <path d="M12 2C12 2 8 6 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 6 12 2 12 2Z" fill="currentColor" opacity="0.3" />
              <path d="M12 14V22M12 14C9.79 14 8 12.21 8 10M12 14C14.21 14 16 12.21 16 10M8 18H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-xl font-black tracking-tight text-foreground">Buff</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.slice(0, 5).map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/docs" className="hidden md:inline-flex text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">
            Docs
          </Link>
          <ThemeToggle />
          <Link href="/dashboard/signup" className="hidden sm:inline-flex bg-foreground text-background text-[14px] font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity">
            Sign up
          </Link>
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center text-foreground"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <List size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-2xl border-b border-border/50 px-6 pb-6">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-3 border-b border-[#ffffff08] last:border-none"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-3 mt-4">
              <Link href="/dashboard/login" className="flex-1 text-center text-sm font-medium text-muted-foreground border border-[#ffffff15] rounded-full py-3 hover:text-foreground transition-colors">
                Log in
              </Link>
              <Link href="/dashboard/signup" className="flex-1 text-center text-sm font-semibold bg-foreground text-background rounded-full py-3 hover:opacity-90 transition-opacity">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
