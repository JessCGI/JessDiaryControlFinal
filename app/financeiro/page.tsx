'use client';

import { useState, useMemo, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { TrendingUp, TrendingDown, Wallet, Settings, PlusCircle, ArrowUpRight, ArrowDownLeft, Trash2 } from 'lucide-react';
import { Transacao } from '@/lib/types';
import { generateId, parseCurrency, formatCurrency } from '@/lib/utils';
import { MOCK_FINANCEIRO } from '@/lib/mock-data';
import PageHeader from '@/components/PageHeader';
import { Modal } from '@/components/modal';
import { FormInput, FormSelect } from '@/components/FormInput';

export default function Financeiro() {
  const [transacoesRaw, setTransacoes] = useLocalStorage<Transacao[]>('jess-financeiro', []);
  const transacoes = transacoesRaw.length > 0 ? transacoesRaw : MOCK_FINANCEIRO;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [contas, setContas] = useLocalStorage<{ id: string; nome: string; saldo: string; tipo: string; cor: string }[]>('jess-contas', [
    { id: '1', nome: 'Nubank', saldo: 'R$ 2.450,00', tipo: 'Principal', cor: 'purple' },
    { id: '2', nome: 'Itaú', saldo: 'R$ 650,00', tipo: 'Corrente', cor: 'orange' },
  ]);
  const [contaForm, setContaForm] = useState({ nome: '', saldo: '', tipo: 'Corrente', cor: 'blue' });
  const [editingContaId, setEditingContaId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    value: string;
    type: Transacao['type'];
    category: string;
  }>({ title: '', value: '', type: 'expense', category: '' });

  const totalIncome = useMemo(() => transacoes
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + parseCurrency(t.value), 0), [transacoes]);

  const totalExpense = useMemo(() => transacoes
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + Math.abs(parseCurrency(t.value)), 0), [transacoes]);

  const totalBalance = useMemo(() => totalIncome - totalExpense, [totalIncome, totalExpense]);

  const handleAddTransacao = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.value) return;

    const parsedValue = parseFloat(formData.value.replace(',', '.'));
    if (isNaN(parsedValue)) return;

    const newTransacao: Transacao = {
      id: generateId(),
      title: formData.title,
      category: formData.category || 'Geral',
      value: `${formData.type === 'income' ? '+' : '-'} ${formatCurrency(parsedValue)}`,
      type: formData.type,
      date: 'Hoje',
    };
    setTransacoes([newTransacao, ...transacoes]);
    setIsModalOpen(false);
    setFormData({ title: '', value: '', type: 'expense', category: '' });
  }, [formData, setTransacoes, transacoes]);

  const quickAdd = useCallback((category: string) => {
    setFormData(prev => ({ ...prev, category, type: 'expense' }));
    setIsModalOpen(true);
  }, []);

  const deleteTransacao = useCallback((id: string) => {
    setTransacoes(transacoes.filter((t) => t.id !== id));
  }, [setTransacoes, transacoes]);

  const handleSaveConta = useCallback(() => {
    if (!contaForm.nome.trim()) return;
    if (editingContaId) {
      setContas((prev: any) => prev.map((c: any) => c.id === editingContaId ? { ...c, ...contaForm } : c));
    } else {
      setContas((prev: any) => [{ id: generateId(), ...contaForm }, ...prev]);
    }
    setContaForm({ nome: '', saldo: '', tipo: 'Corrente', cor: 'blue' });
    setEditingContaId(null);
    setIsAccountModalOpen(false);
  }, [contaForm, editingContaId, setContas]);

  const handleDeleteConta = useCallback((id: string) => {
    setContas((prev: any) => prev.filter((c: any) => c.id !== id));
  }, [setContas]);

  const handleEditConta = useCallback((conta: any) => {
    setContaForm({ nome: conta.nome, saldo: conta.saldo, tipo: conta.tipo, cor: conta.cor });
    setEditingContaId(conta.id);
    setIsAccountModalOpen(true);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Financeiro" subtitle="Jess Diary Control" />

      <main className="flex-1 w-full max-w-2xl mx-auto pb-24">
        <div className="px-4 py-6">
          <h2 className="text-primary/60 text-xs font-bold leading-normal tracking-[0.2em] text-center font-mono">MÊS ATUAL</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 px-4 mb-6">
          <div className="flex flex-col gap-2 rounded-xl p-5 bg-primary/5 border border-primary/10">
            <p className="text-slate-400 text-xs font-mono font-bold tracking-tighter uppercase">ENTRADAS</p>
            <p className="text-emerald-500 tracking-tight text-xl font-bold font-mono">{formatCurrency(totalIncome)}</p>
            <div className="flex items-center gap-1 text-emerald-500/80 text-xs font-medium">
              <TrendingUp size={14} />
              <span>Total</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 rounded-xl p-5 bg-primary/5 border border-primary/10">
            <p className="text-slate-400 text-xs font-mono font-bold tracking-tighter uppercase">SAÍDAS</p>
            <p className="text-rose-500 tracking-tight text-xl font-bold font-mono">{formatCurrency(totalExpense)}</p>
            <div className="flex items-center gap-1 text-rose-500/80 text-xs font-medium">
              <TrendingDown size={14} />
              <span>Total</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 rounded-xl p-5 bg-primary/20 border border-primary/20">
            <p className="text-primary-300 text-xs font-mono font-bold tracking-tighter uppercase">SALDO TOTAL</p>
            <p className="text-slate-100 tracking-tight text-xl font-bold font-mono">{formatCurrency(totalBalance)}</p>
            <div className="flex items-center gap-1 text-emerald-500/80 text-xs font-medium">
              <Wallet size={14} />
              <span>{totalBalance >= 0 ? 'Em dia' : 'Atenção'}</span>
            </div>
          </div>
        </div>

        <div className="px-4 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-mono font-bold text-slate-400 uppercase tracking-widest">MINHAS CONTAS</h3>
            <button onClick={() => { setContaForm({ nome: '', saldo: '', tipo: 'Corrente', cor: 'blue' }); setEditingContaId(null); setIsAccountModalOpen(true); }} className="text-xs font-mono font-bold text-primary uppercase tracking-tight flex items-center gap-1 hover:opacity-70 transition-opacity">
              Gerenciar
              <Settings size={14} />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4">
            {contas.map((conta) => (
              <div key={conta.id} className="flex-none w-44 flex flex-col gap-2 rounded-xl p-4 bg-[#111118] border border-primary/10 relative group">
                <div className="flex items-center justify-between mb-1">
                  <div className={`size-6 rounded-full flex items-center justify-center ${conta.cor === 'purple' ? 'bg-purple-600/20' : conta.cor === 'orange' ? 'bg-orange-600/20' : conta.cor === 'green' ? 'bg-emerald-600/20' : 'bg-blue-600/20'}`}>
                    <Wallet size={14} className={`${conta.cor === 'purple' ? 'text-purple-600' : conta.cor === 'orange' ? 'text-orange-600' : conta.cor === 'green' ? 'text-emerald-600' : 'text-blue-600'}`} />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">{conta.tipo}</span>
                </div>
                <p className="text-xs font-bold text-slate-100">{conta.nome}</p>
                <p className="text-sm font-mono font-bold text-primary">{conta.saldo}</p>
                <div className="absolute top-2 right-2 hidden group-hover:flex gap-1">
                  <button onClick={() => handleEditConta(conta)} className="p-1 rounded bg-slate-700 hover:bg-slate-600 transition-colors">
                    <Settings size={10} className="text-slate-300" />
                  </button>
                  <button onClick={() => handleDeleteConta(conta.id)} className="p-1 rounded bg-red-900/50 hover:bg-red-800 transition-colors">
                    <Trash2 size={10} className="text-red-400" />
                  </button>
                </div>
              </div>
            ))}
            <button onClick={() => { setContaForm({ nome: '', saldo: '', tipo: 'Corrente', cor: 'blue' }); setEditingContaId(null); setIsAccountModalOpen(true); }} className="flex-none w-44 flex flex-col items-center justify-center gap-2 rounded-xl p-4 border border-dashed border-primary/30 hover:border-primary/70 transition-colors text-primary/50 hover:text-primary">
              <PlusCircle size={20} />
              <span className="text-xs font-mono">Nova Conta</span>
            </button>
          </div>
        </div>

        <div className="px-4 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-mono font-bold text-slate-400 uppercase tracking-widest">Gastos Diários</h3>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Almoço', cat: 'Alimentação', icon: '🍱' },
              { label: 'Uber', cat: 'Transporte', icon: '🚗' },
              { label: 'Café', cat: 'Lazer', icon: '☕' },
              { label: 'Mercado', cat: 'Casa', icon: '🛒' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => quickAdd(item.cat)}
                className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 mb-8">
          <button onClick={() => setIsModalOpen(true)} className="w-full flex cursor-pointer items-center justify-center rounded-xl h-14 px-5 bg-primary text-white gap-3 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
            <PlusCircle size={24} />
            <span className="text-base font-bold tracking-tight">Nova Transação</span>
          </button>
        </div>

        <div className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-mono font-bold text-slate-400 uppercase tracking-widest">Transações Recentes</h3>
          </div>
          <div className="space-y-3">
            {transacoes.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                <p className="font-mono text-xs uppercase tracking-widest">Nenhuma transação</p>
              </div>
            )}
            {transacoes.map(transacao => (
              <div key={transacao.id} className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/5 group relative">
                <button
                  onClick={() => deleteTransacao(transacao.id)}
                  className="absolute -left-2 -top-2 z-30 p-1.5 bg-black/50 hover:bg-red-500/80 text-white rounded-full backdrop-blur-md transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
                <div className="flex items-center gap-4">
                  <div className={`flex size-10 items-center justify-center rounded-full ${transacao.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {transacao.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-100">{transacao.title}</p>
                    <p className="text-xs font-mono text-slate-400">{transacao.category} • {transacao.date}</p>
                  </div>
                </div>
                <p className={`${transacao.type === 'income' ? 'text-emerald-500' : 'text-rose-500'} font-mono font-bold`}>{transacao.value}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal Nova Transação */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Transação">
        <form onSubmit={handleAddTransacao} className="space-y-4">
          <FormInput
            label="Descrição"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ex: Venda de Projeto UI"
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Valor"
              type="number"
              step="0.01"
              required
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="Ex: 150.00"
            />
            <FormSelect
              label="Tipo"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Transacao['type'] })}
            >
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </FormSelect>
          </div>
          <FormInput
            label="Categoria"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Ex: Freelance"
          />
          <div className="pt-4">
            <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-colors">
              Salvar Transação
            </button>
          </div>
        </form>
      </Modal>

      {/* Account Management Modal */}
      <Modal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} title={editingContaId ? 'Editar Conta' : 'Nova Conta'}>
        <div className="flex flex-col gap-4">
          <FormInput
            label="Nome da Conta"
            value={contaForm.nome}
            onChange={(e) => setContaForm(prev => ({ ...prev, nome: e.target.value }))}
            placeholder="Ex: Nubank, Bradesco..."
          />
          <FormInput
            label="Saldo"
            value={contaForm.saldo}
            onChange={(e) => setContaForm(prev => ({ ...prev, saldo: e.target.value }))}
            placeholder="Ex: R$ 1.500,00"
          />
          <FormSelect
            label="Tipo"
            value={contaForm.tipo}
            onChange={(e) => setContaForm(prev => ({ ...prev, tipo: e.target.value }))}
          >
            <option value="Principal">Principal</option>
            <option value="Corrente">Corrente</option>
            <option value="Poupança">Poupança</option>
            <option value="Investimento">Investimento</option>
            <option value="Cartão">Cartão</option>
          </FormSelect>
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-1 block">Cor</label>
            <div className="flex gap-2">
              {(['purple', 'orange', 'blue', 'green']).map(cor => (
                <button key={cor} onClick={() => setContaForm(prev => ({ ...prev, cor }))} className={`w-8 h-8 rounded-full border-2 transition-all ${contaForm.cor === cor ? 'border-white scale-110' : 'border-transparent'} ${cor === 'purple' ? 'bg-purple-600' : cor === 'orange' ? 'bg-orange-600' : cor === 'green' ? 'bg-emerald-600' : 'bg-blue-600'}`} />
              ))}
            </div>
          </div>
          <button onClick={handleSaveConta} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-colors mt-2">
            {editingContaId ? 'Salvar Alterações' : 'Adicionar Conta'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
