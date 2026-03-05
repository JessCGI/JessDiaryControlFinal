'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Check, Trash2, Plus, Loader2 } from 'lucide-react';
import { Habito } from '@/lib/types';
import PageHeader from '@/components/PageHeader';
import { Modal } from '@/components/modal';
import { FormInput, FormSelect } from '@/components/FormInput';
import EmptyState from '@/components/EmptyState';
import { createClient } from '@/lib/supabase/client';

export default function Habitos() {
  const supabase = createClient();
  const [habitos, setHabitos] = useState<Habito[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newHabito, setNewHabito] = useState({ title: '', time: '08:00', frequency: 'Diário' });

  useEffect(() => {
    async function fetchHabitos() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }
      setUserId(user.id);

      const { data, error } = await supabase
        .from('habitos')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setHabitos(data as Habito[]);
      }
      setIsLoading(false);
    }
    fetchHabitos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addHabito = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabito.title.trim() || !userId) return;
    setIsSaving(true);

    const habito = {
      title: newHabito.title,
      time: newHabito.time,
      frequency: newHabito.frequency,
      days: [false, false, false, false, false, false, false],
      streak: 0,
      user_id: userId
    };

    const { data, error } = await supabase
      .from('habitos')
      .insert([habito])
      .select()
      .single();

    if (data) {
      setHabitos([data as Habito, ...habitos]);
    }

    setNewHabito({ title: '', time: '08:00', frequency: 'Diário' });
    setIsModalOpen(false);
    setIsSaving(false);
  };

  const deleteHabito = async (id: string) => {
    setHabitos(habitos.filter((h) => h.id !== id));
    await supabase.from('habitos').delete().eq('id', id);
  };

  const toggleDay = async (habitoId: string, dayIndex: number) => {
    const habito = habitos.find((h) => h.id === habitoId);
    if (!habito || !habito.days) return;

    const newDays = [...habito.days];
    newDays[dayIndex] = !newDays[dayIndex];

    setHabitos(habitos.map((h) => h.id === habitoId ? { ...h, days: newDays } : h));

    await supabase.from('habitos').update({ days: newDays }).eq('id', habitoId);
  };

  const habitosList = useMemo(() => habitos, [habitos]);

  return (
    <div className="flex flex-col min-h-screen relative">
      <PageHeader title="Hábitos" />

      <main className="flex-1 overflow-y-auto pb-24">
        <div className="px-4 pt-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-slate-400 text-xs font-bold leading-tight tracking-widest uppercase">ÚLTIMOS 7 DIAS</h2>
            <div className="flex gap-[8px] pr-1">
              {['S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                <span key={i} className="w-[28px] text-center text-[10px] text-slate-500 font-mono">{d}</span>
              ))}
              <span className="w-[28px] text-center text-[10px] text-primary font-mono font-bold">D</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <Loader2 className="animate-spin mb-2" size={24} />
                <p className="font-mono text-sm uppercase tracking-widest">Carregando...</p>
              </div>
            ) : habitosList.length === 0 ? (
              <EmptyState icon={<Plus size={48} />} message="Nenhum hábito encontrado" />
            ) : (
              habitosList.map((habito) => (
                <div key={habito.id} className={`grid grid-cols-[1fr_repeat(7,28px)] gap-2 items-center p-3 rounded-xl bg-slate-900/50 border border-slate-800 ${(habito.days || []).every((d) => !d) ? 'opacity-60' : ''}`}>
                  <div className="flex flex-col min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-100 font-semibold truncate">{habito.title}</span>
                      <Trash2 size={14} onClick={() => deleteHabito(habito.id)} className="text-slate-400 cursor-pointer hover:text-red-500" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 mt-1 uppercase">{habito.time} • {habito.frequency}</span>
                  </div>
                  {(habito.days || [false, false, false, false, false, false, false]).map((completed, index) => (
                    <div
                      key={index}
                      onClick={() => toggleDay(habito.id, index)}
                      className={`w-7 h-7 rounded flex items-center justify-center cursor-pointer transition-all ${completed
                        ? 'bg-primary-purple text-white'
                        : index === 6
                          ? 'bg-slate-800 border-2 border-primary-purple/50'
                          : 'bg-slate-800 border border-slate-700 hover:border-slate-600'
                        }`}
                    >
                      {completed && <Check size={16} />}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          <div className="mt-8">
            <button onClick={() => setIsModalOpen(true)} className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-4 bg-primary text-white gap-2 text-sm font-bold leading-normal tracking-wide shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
              <Plus size={20} />
              <span className="truncate">Novo Hábito</span>
            </button>
          </div>
        </div>
      </main>

      {/* Modal Novo Hábito */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Hábito">
        <form onSubmit={addHabito} className="space-y-4">
          <FormInput
            label="Nome do Hábito"
            required
            value={newHabito.title}
            onChange={(e) => setNewHabito({ ...newHabito, title: e.target.value })}
            placeholder="Ex: Beber 2L de água"
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Horário"
              type="time"
              value={newHabito.time}
              onChange={(e) => setNewHabito({ ...newHabito, time: e.target.value })}
            />
            <FormSelect
              label="Frequência"
              value={newHabito.frequency}
              onChange={(e) => setNewHabito({ ...newHabito, frequency: e.target.value })}
            >
              <option value="Diário">Diário</option>
              <option value="Semanal">Semanal</option>
              <option value="5x Semana">5x Semana</option>
              <option value="Finais de Semana">Finais de Semana</option>
            </FormSelect>
          </div>
          <div className="pt-4">
            <button disabled={isSaving} type="submit" className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors">
              {isSaving ? <Loader2 className="animate-spin text-white flex mx-auto" size={20} /> : 'Salvar Hábito'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
