'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { TrendingUp, Plus, ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react';
import { Ativo } from '@/lib/types';
import { generateId, parseCurrency, formatCurrency } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';
import { Modal } from '@/components/modal';
import { FormInput, FormSelect } from '@/components/FormInput';
import EmptyState from '@/components/EmptyState';

const ATIVO_COLORS: Record<string, string> = {
  'blue': 'bg-blue-500',
  'emerald': 'bg-emerald-500',
  'yellow': 'bg-yellow-500',
  'red': 'bg-red-500',
  'purple': 'bg-purple-500',
};

const ATIVO_TEXT_COLORS: Record<string, string> = {
  'blue': 'text-blue-500',
  'emerald': 'text-emerald-500',
  'yellow': 'text-yellow-500',
  'red': 'text-red-500',
  'purple': 'text-purple-500',
};

export default function Investimentos() {
  const [ativos, setAtivos] = useLocalStorage<Ativo[]>('jess-investimentos', []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAtivo, setNewAtivo] = useState({
    ticker: '',
    type: 'Ação',
    allocation: '0',
    invested: '',
    current: '',
    yield: '0',
    color: 'blue'
  });

  const addAtivo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAtivo.ticker.trim()) return;

    const ativo: Ativo = {
      id: generateId(),
      ticker: newAtivo.ticker.toUpperCase(),
      type: newAtivo.type,
      allocation: parseInt(newAtivo.allocation) || 0,
      invested: newAtivo.invested,
      current: newAtivo.current,
      yield: newAtivo.yield,
      color: newAtivo.color
    };

    setAtivos([ativo, ...ativos]);
    setIsModalOpen(false);
    setNewAtivo({ ticker: '', type: 'Ação', allocation: '0', invested: '', current: '', yield: '0', color: 'blue' });
  };

  const deleteAtivo = (id: string) => {
    setAtivos(ativos.filter((a) => a.id !== id));
  };

  const totalInvestido = ativos.reduce((acc, a) => acc + parseCurrency(a.invested), 0);
  const totalAtual = ativos.reduce((acc, a) => acc + parseCurrency(a.current), 0);
  const lucroTotal = totalAtual - totalInvestido;
  const rentabilidadeTotal = totalInvestido > 0 ? (lucroTotal / totalInvestido) * 100 : 0;

  return (
    <div className="flex flex-col min-h-screen relative">
      <PageHeader title="Investimentos" subtitle="Gestão de Ativos" />

      <div className="px-6 pt-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp size={80} />
          </div>
          <div className="relative z-10">
            <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mb-1">Patrimônio Total</p>
            <h2 className="text-3xl font-bold text-white mb-4">{formatCurrency(totalAtual)}</h2>
            <div className="flex gap-6">
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-mono mb-1">Rentabilidade</p>
                <div className={`flex items-center gap-1 font-bold ${lucroTotal >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {lucroTotal >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  <span>{rentabilidadeTotal.toFixed(2)}%</span>
                </div>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-mono mb-1">Lucro/Prejuízo</p>
                <p className={`font-bold ${lucroTotal >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {formatCurrency(lucroTotal)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-primary-purple hover:bg-primary-purple/90 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary-purple/20">
          <Plus size={20} />
          <span>Novo Ativo</span>
        </button>
      </div>

      <main className="flex-1 px-6 space-y-4 pb-24 mt-4">
        <h3 className="text-slate-400 text-xs font-bold leading-tight tracking-widest uppercase mb-2">SUA CARTEIRA</h3>

        {ativos.length === 0 ? (
          <EmptyState icon={<TrendingUp size={48} />} message="Nenhum ativo encontrado" />
        ) : (
          ativos.map((ativo) => {
            const lucro = parseCurrency(ativo.current) - parseCurrency(ativo.invested);
            const rentabilidade = parseCurrency(ativo.invested) > 0 ? (lucro / parseCurrency(ativo.invested)) * 100 : 0;

            return (
              <div key={ativo.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${ATIVO_COLORS[ativo.color] || ATIVO_COLORS['blue']}`}>
                      {ativo.ticker.substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-white font-bold">{ativo.ticker}</h4>
                      <p className="text-slate-500 text-[10px] uppercase font-mono">{ativo.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-white font-bold">{ativo.current}</p>
                      <div className={`flex items-center justify-end gap-1 text-[10px] font-bold ${lucro >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {lucro >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                        <span>{rentabilidade.toFixed(2)}%</span>
                      </div>
                    </div>
                    <button onClick={() => deleteAtivo(ativo.id)} className="text-slate-600 hover:text-red-500 p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-mono uppercase">
                    <span className="text-slate-500">Alocação Alvo</span>
                    <span className="text-slate-300">{ativo.allocation}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${ATIVO_COLORS[ativo.color] || ATIVO_COLORS['blue']}`} style={{ width: `${ativo.allocation}%` }}></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800">
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-mono mb-1">Investido</p>
                    <p className="text-slate-300 font-bold text-sm">{ativo.invested}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-mono mb-1">Yield Anual</p>
                    <p className={`font-bold text-sm ${ATIVO_TEXT_COLORS[ativo.color] || ATIVO_TEXT_COLORS['blue']}`}>{ativo.yield}%</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* Modal Novo Ativo */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Ativo">
        <form onSubmit={addAtivo} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Ticker"
              required
              value={newAtivo.ticker}
              onChange={(e) => setNewAtivo({ ...newAtivo, ticker: e.target.value })}
              placeholder="Ex: PETR4"
            />
            <FormSelect
              label="Tipo"
              value={newAtivo.type}
              onChange={(e) => setNewAtivo({ ...newAtivo, type: e.target.value })}
            >
              <option value="Ação">Ação</option>
              <option value="FII">FII</option>
              <option value="Crypto">Crypto</option>
              <option value="ETF">ETF</option>
              <option value="BDR">BDR</option>
            </FormSelect>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Investido (R$)"
              required
              value={newAtivo.invested}
              onChange={(e) => setNewAtivo({ ...newAtivo, invested: e.target.value })}
              placeholder="Ex: 1.500,00"
            />
            <FormInput
              label="Atual (R$)"
              required
              value={newAtivo.current}
              onChange={(e) => setNewAtivo({ ...newAtivo, current: e.target.value })}
              placeholder="Ex: 1.800,00"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Alocação (%)"
              type="number"
              value={newAtivo.allocation}
              onChange={(e) => setNewAtivo({ ...newAtivo, allocation: e.target.value })}
              placeholder="Ex: 10"
            />
            <FormInput
              label="Yield (%)"
              value={newAtivo.yield}
              onChange={(e) => setNewAtivo({ ...newAtivo, yield: e.target.value })}
              placeholder="Ex: 8.5"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1 uppercase tracking-wider">Cor do Ativo</label>
            <div className="flex gap-3 mt-2">
              {['blue', 'emerald', 'yellow', 'red', 'purple'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewAtivo({ ...newAtivo, color: c })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${newAtivo.color === c ? 'border-white scale-110' : 'border-transparent'} ${ATIVO_COLORS[c]}`}
                ></button>
              ))}
            </div>
          </div>
          <div className="pt-4">
            <button type="submit" className="w-full bg-primary-purple hover:bg-primary-purple/90 text-white font-bold py-3 rounded-xl transition-colors">
              Adicionar Ativo
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
