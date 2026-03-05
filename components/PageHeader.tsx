'use client';

import Link from 'next/link';
import { ChevronLeft, LogOut } from 'lucide-react';
import { ReactNode } from 'react';
import { logout } from '@/app/login/actions';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightElement?: ReactNode;
}

export default function PageHeader({ title, subtitle, showBack = true, rightElement }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background-dark/80 backdrop-blur-md border-b border-slate-800 px-4 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <Link href="/" className="text-primary flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <ChevronLeft size={24} />
            </Link>
          )}
          <div>
            <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-100">{title}</h1>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-widest font-medium">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {rightElement || (
            <button
              onClick={() => logout()}
              className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 hover:bg-red-500/20 transition-colors group"
              title="Sair da conta"
            >
              <LogOut size={18} className="text-red-500 group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
