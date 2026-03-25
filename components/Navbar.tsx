"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/log", label: "Log Decision" },
  { href: "/ask", label: "Ask Memory" }
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="frosted-navbar sticky top-0 z-30 transition-all">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-8 py-4">
        <Link
          href="/"
          className="flex items-center gap-[10px] select-none group"
          style={{ alignItems: 'center' }}
        >
          {/* Upgraded SVG Icon */}
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'block' }}
          >
            <defs>
              <linearGradient id="logo-bg" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38bdf8" stopOpacity="0.15" />
                <stop offset="1" stopColor="#818cf8" stopOpacity="0.15" />
              </linearGradient>
              <linearGradient id="logo-stroke" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38bdf8" />
                <stop offset="1" stopColor="#818cf8" />
              </linearGradient>
              <linearGradient id="circle-stroke" x1="9" y1="14" x2="19" y2="14" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38bdf8" />
                <stop offset="1" stopColor="#818cf8" />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="24" height="24" rx="7" fill="url(#logo-bg)" stroke="url(#logo-stroke)" strokeWidth="1.5" />
            <circle cx="14" cy="14" r="5" fill="none" stroke="url(#circle-stroke)" strokeWidth="1.5" />
            <circle cx="14" cy="14" r="2" fill="#38bdf8" />
          </svg>
          {/* Gradient SVG Text */}
          <svg height="28" width="140" viewBox="0 0 140 28" style={{ display: 'block' }}>
            <defs>
              <linearGradient id="text-gradient" x1="0" y1="0" x2="140" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38bdf8" />
                <stop offset="1" stopColor="#818cf8" />
              </linearGradient>
            </defs>
            <text
              x="0"
              y="22"
              fontFamily="'Inter', 'Segoe UI', Arial, sans-serif"
              fontSize="24"
              fontWeight="800"
              letterSpacing="3px"
              fill="url(#text-gradient)"
              style={{
                textRendering: 'optimizeLegibility',
                WebkitFontSmoothing: 'antialiased',
                filter: 'none',
                transition: 'filter 0.3s cubic-bezier(0.4,0,0.2,1)',
              }}
              className="logo-gradient-text"
            >
              REPCODE
            </text>
          </svg>
          <style jsx>{`
            .group:hover .logo-gradient-text {
              filter: brightness(1.15);
              transition: filter 0.3s cubic-bezier(0.4,0,0.2,1);
            }
          `}</style>
        </Link>
        <div className="flex items-center gap-4">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-base font-semibold transition-colors duration-200 text-white/90 group ${isActive ? 'text-electric-blue' : 'hover:text-electric-blue'}`}
                style={{ fontFamily: `'Inter', 'Segoe UI', 'Arial', 'sans-serif'` }}
              >
                <span>{link.label}</span>
                <span
                  className={`absolute left-0 right-0 -bottom-1 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-${isActive ? '100' : '0'} pointer-events-none transition-opacity duration-150`}
                  style={{
                    opacity: isActive ? 1 : 0,
                    transition: 'opacity 150ms',
                    boxShadow: isActive ? '0 0 8px 2px #2563eb88' : undefined,
                  }}
                />
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
