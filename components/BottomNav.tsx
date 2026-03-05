'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ListTodo, CheckCircle, Box, Wallet, FileText, TrendingUp } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Início', href: '/', icon: LayoutDashboard },
    { name: 'Tarefas', href: '/tarefas', icon: ListTodo },
    { name: 'Hábitos', href: '/habitos', icon: CheckCircle },
    { name: 'Projetos', href: '/projetos', icon: Box },
    { name: 'Notas', href: '/notas', icon: FileText },
    { name: 'Invest', href: '/investimentos', icon: TrendingUp },
    { name: 'Finanças', href: '/financeiro', icon: Wallet },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-between border-t border-slate-800 bg-[#0a0a0f]/95 backdrop-blur-md px-2 pb-6 pt-2 overflow-x-auto no-scrollbar">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-end gap-1 min-w-[64px] ${
              isActive ? 'text-primary' : 'text-slate-500 hover:text-slate-300'
            } transition-colors`}
          >
            <div className="flex h-8 items-center justify-center">
              <Icon size={20} className={isActive ? 'fill-primary/20' : ''} />
            </div>
            <p className="font-mono text-[9px] font-bold uppercase tracking-wider">
              {item.name}
            </p>
          </Link>
        );
      })}
    </nav>
  );
}
