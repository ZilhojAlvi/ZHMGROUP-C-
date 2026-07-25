import Link from "next/link";
import { Building2, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-black/5 dark:border-white/10 bg-navy-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient text-white">
                <Building2 size={18} />
              </span>
              <span className="font-display text-lg font-bold text-white">SRMS</span>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Smart Real Estate Management System — search, book, and manage
              properties with clarity and confidence.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Platform</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li><Link href="/properties" className="hover:text-brand-300">Browse properties</Link></li>
              <li><Link href="/signup" className="hover:text-brand-300">Create an account</Link></li>
              <li><Link href="/login" className="hover:text-brand-300">Sign in</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2"><MapPin size={14}/> Sonargaon, Narayanganj, Bangladesh</li>
              <li className="flex items-center gap-2"><Mail size={14}/> youare2320@gmail.com</li>
              <li className="flex items-center gap-2"><Phone size={14}/> 01957471426</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">About</h4>
            <p className="mt-3 text-sm text-slate-400">
              Owned &amp; operated by Zilhoj Mohammad Alvi.
            </p>
            <p className="mt-3 text-xs text-slate-500">
              Deep Blue theme · Clean Architecture · Real REST API
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} SRMS. All rights reserved.</p>
          <p>Deep Blue theme · Built with Next.js</p>
        </div>
      </div>
    </footer>
  );
}
