"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/upload", label: "Upload" },
  { href: "/ask", label: "Ask" },
  { href: "/log", label: "Log" }
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-sm font-semibold tracking-wide text-zinc-100">
          REPCODE
        </Link>
        <div className="flex items-center gap-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-zinc-100 text-zinc-900"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
