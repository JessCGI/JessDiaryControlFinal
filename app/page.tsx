'use client';

import { useLocalStorage } from '@/hooks/use-local-storage';
import { Bell, ListTodo, LineChart, Network, CircleDollarSign } from 'lucide-react';
import Link from 'next/link';
import { Tarefa, Habito, Projeto, Transacao } from '@/lib/types';
import { parseCurrency, formatCurrency } from '@/lib/utils';
import { MOCK_TAREFAS, MOCK_HABITOS, MOCK_PROJETOS, MOCK_FINANCEIRO } from '@/lib/mock-data';
import { useMemo } from 'react';
import PageHeader from '@/components/PageHeader';

export default function Dashboard() {
  const [tarefasRaw] = useLocalStorage<Tarefa[]>('jess-tarefas', []);
  const [habitosRaw] = useLocalStorage<Habito[]>('jess-habitos', []);
  const [projetosRaw] = useLocalStorage<Projeto[]>('jess-projetos', []);
  const [transacoesRaw] = useLocalStorage<Transacao[]>('jess-financeiro', []);

  const tarefas = useMemo(() => tarefasRaw.length > 0 ? tarefasRaw : MOCK_TAREFAS, [tarefasRaw]);
  const habitos = useMemo(() => habitosRaw.length > 0 ? habitosRaw : MOCK_HABITOS, [habitosRaw]);
  const projetos = useMemo(() => projetosRaw.length > 0 ? projetosRaw : MOCK_PROJETOS, [projetosRaw]);
  const transacoes = useMemo(() => transacoesRaw.length > 0 ? transacoesRaw : MOCK_FINANCEIRO, [transacoesRaw]);

  const pendingTasks = useMemo(() => tarefas.filter((t) => !t.completed).length, [tarefas]);

  const habitsPercentage = useMemo(() => {
    const todayHabits = habitos.filter((h) => h.days[0]).length;
    const totalHabits = habitos.length;
    return totalHabits > 0 ? Math.round((todayHabits / totalHabits) * 100) : 0;
  }, [habitos]);

  const activeProjects = useMemo(() => projetos.filter((p) => p.progress < 100).length, [projetos]);

  const balanceFormatted = useMemo(() => {
    let balance = 0;
    transacoes.forEach((t) => {
      const val = parseCurrency(t.value);
      if (t.type === 'income') balance += val;
      else balance -= val;
    });
    return formatCurrency(balance);
  }, [transacoes]);

  const urgentTasks = useMemo(() => tarefas.filter((t) => !t.completed && t.priority === 'Urgente').slice(0, 2), [tarefas]);
  const ongoingProjects = useMemo(() => projetos.filter((p) => p.progress < 100).slice(0, 2), [projetos]);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
      <PageHeader
        title="Jess Diary Control"
        showBack={false}
        rightElement={
          <div className="size-10 flex items-center justify-center">
            <Bell size={24} className="text-primary" />
          </div>
        }
      />

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-6">
        {/* Technical Grid 2x2 */}
        <div className="grid grid-cols-2 gap-3">
          {/* TAREFAS PENDENTES */}
          <Link href="/tarefas" className="flex flex-col gap-2 rounded-lg border border-primary/20 bg-slate-900/50 p-4 border-l-4 border-l-yellow-500 hover:bg-slate-800/50 transition-colors">
            <div className="flex justify-between items-start">
              <ListTodo size={20} className="text-yellow-500" />
              <span className="font-mono text-[10px] text-slate-500 uppercase">Status: Ativo</span>
            </div>
            <div className="flex flex-col">
              <h3 className="font-display text-[10px] text-slate-500 uppercase tracking-widest">Tarefas Pendentes</h3>
              <p className="font-mono text-3xl font-bold text-yellow-500">{pendingTasks}</p>
            </div>
          </Link>

          {/* HÁBITOS HOJE */}
          <Link href="/habitos" className="flex flex-col gap-2 rounded-lg border border-primary/20 bg-slate-900/50 p-4 border-l-4 border-l-purple-500 hover:bg-slate-800/50 transition-colors">
            <div className="flex justify-between items-start">
              <LineChart size={20} className="text-purple-500" />
              <span className="font-mono text-[10px] text-slate-500 uppercase">Meta: 90%</span>
            </div>
            <div className="flex flex-col">
              <h3 className="font-display text-[10px] text-slate-500 uppercase tracking-widest">Hábitos Hoje</h3>
              <p className="font-mono text-3xl font-bold text-purple-500">{habitsPercentage}%</p>
            </div>
          </Link>

          {/* PROJETOS ATIVOS */}
          <Link href="/projetos" className="flex flex-col gap-2 rounded-lg border border-primary/20 bg-slate-900/50 p-4 border-l-4 border-l-blue-500 hover:bg-slate-800/50 transition-colors">
            <div className="flex justify-between items-start">
              <Network size={20} className="text-blue-500" />
              <span className="font-mono text-[10px] text-slate-500 uppercase">Q3 / 2024</span>
            </div>
            <div className="flex flex-col">
              <h3 className="font-display text-[10px] text-slate-500 uppercase tracking-widest">Projetos Ativos</h3>
              <p className="font-mono text-3xl font-bold text-blue-500">{activeProjects < 10 ? `0${activeProjects}` : activeProjects}</p>
            </div>
          </Link>

          {/* SALDO MENSAL */}
          <Link href="/financeiro" className="flex flex-col gap-2 rounded-lg border border-primary/20 bg-slate-900/50 p-4 border-l-4 border-l-green-500 hover:bg-slate-800/50 transition-colors">
            <div className="flex justify-between items-start">
              <CircleDollarSign size={20} className="text-green-500" />
              <span className="font-mono text-[10px] text-slate-500 uppercase">Balanço</span>
            </div>
            <div className="flex flex-col">
              <h3 className="font-display text-[10px] text-slate-500 uppercase tracking-widest">Saldo Mensal</h3>
              <p className="font-mono text-xl font-bold text-green-500 truncate">{balanceFormatted}</p>
            </div>
          </Link>
        </div>

        {/* Urgent Tasks Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold uppercase tracking-tighter">Tarefas Urgentes</h3>
            <span className="font-mono text-[10px] text-red-500 animate-pulse">● LIVE_FEED</span>
          </div>
          <div className="space-y-2">
            {urgentTasks.map((tarefa) => (
              <div key={tarefa.id} className="flex items-center justify-between bg-slate-900/30 p-3 rounded-md border-l-4 border-l-red-600 border border-primary/20">
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{tarefa.title}</span>
                  <span className="font-mono text-[10px] text-slate-500 uppercase tracking-tight">{tarefa.tag}</span>
                </div>
                <div className="bg-red-500/10 text-red-500 px-2 py-1 rounded font-mono text-[10px] font-bold border border-red-500/20">
                  {tarefa.date}
                </div>
              </div>
            ))}
            {urgentTasks.length === 0 && (
              <div className="text-sm text-slate-500 italic">Nenhuma tarefa urgente.</div>
            )}
          </div>
        </section>

        {/* Projects in Progress Section */}
        <section className="space-y-3">
          <h3 className="font-display text-sm font-bold uppercase tracking-tighter">Projetos em Andamento</h3>
          <div className="grid gap-4">
            {ongoingProjects.map((projeto) => (
              <div key={projeto.id} className="bg-slate-900/40 p-4 rounded-lg border border-primary/20 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-blue-500"></span>
                    <span className="font-mono text-xs font-bold">{projeto.title}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">ID: {String(projeto.id).substring(0, 8)}</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full" style={{ width: `${projeto.progress}%` }}></div>
                </div>
                <div className="flex justify-between font-mono text-[9px] text-slate-500 uppercase">
                  <span>Progresso: {projeto.progress}%</span>
                  <span>Entrega: {projeto.date}</span>
                </div>
              </div>
            ))}
            {ongoingProjects.length === 0 && (
              <div className="text-sm text-slate-500 italic">Nenhum projeto em andamento.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
