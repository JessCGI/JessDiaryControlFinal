'use client';

import { useState, useCallback, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Check, Trash2, Plus } from 'lucide-react';
import { generateId } from '@/lib/utils';
import { Habito } from '@/lib/types';
import PageHeader from '@/components/PageHeader';
import { Modal } from '@/components/modal';
import { FormInput, FormSelect } from '@/components/FormInput';
import EmptyState from '@/components/EmptyState';

export default function Habitos() {
  const [habitos, setHabitos] = useLocalStorage<Habito[]>('jess-habitos', []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHabito, setNewHabito] = useState({ title: '', time: '08:00', frequency: 'Diário' });

  const addHabito = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabito.title.trim()) return;
    const habito: Habito = {
      id: generateId(),
      title: newHabito.title,
      time: newHabito.time,
      frequency: newHabito.frequency,
      days: [false, false, false, false, false, false, false]
    };
    setHabitos(prev => [...prev, habito]);
    setNewHabito({ title: '', time: '08:00', frequency: 'Diário' });
    setIsModalOpen(false);
  }, [newHabito, setHabitos]);

  const deleteHabito = useCallback((id: string) => {
    setHabitos(prev => prev.filter((h) => h.id !== id));
  }, [setHabitos]);

  const toggleDay = useCallback((habitoId: string, dayIndex: number) => {
    setHabitos(prev => prev.map((h) => {
      if (h.id === habitoId) {
        const newDays = [...h.days];
        newDays[dayIndex] = !newDays[dayIndex];
        return { ...h, days: newDays };
      }
      return h;
    }));
  }, [setHabitos]);

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
            {habitosList.length === 0 ? (
              <EmptyState icon={<Plus size={48} />} message="Nenhum hábito encontrado" />
            ) : (
              habitosList.map((habito) => (
                <div key={habito.id} className={`grid grid-cols-[1fr_repeat(7,28px)] gap-2 items-center p-3 rounded-xl bg-slate-900/50 border border-slate-800 ${habito.days.every((d) => !d) ? 'opacity-60' : ''}`}>
                  <div className="flex flex-col min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-100 font-semibold truncate">{habito.title}</span>
                      <Trash2 size={14} onClick={() => deleteHabito(habito.id)} className="text-slate-400 cursor-pointer hover:text-red-500" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 mt-1 uppercase">{habito.time} • {habito.frequency}</span>
                  </div>
                  {habito.days.map((completed, index) => (
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
            <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-colors">
              Salvar Hábito
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
