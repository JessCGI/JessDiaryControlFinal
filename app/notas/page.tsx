'use client';

import { useState, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Nota } from '@/lib/types';
import { generateId } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';
import { Modal } from '@/components/modal';
import { FormInput, FormTextarea } from '@/components/FormInput';

export default function Notas() {
  const [notas, setNotas] = useLocalStorage<Nota[]>('jess-notas', []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });

  const handleAddNota = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    const newNota: Nota = {
      id: generateId(),
      title: formData.title,
      content: formData.content || '',
      date: 'Hoje',
      image: Math.random() > 0.5 ? `https://picsum.photos/seed/${generateId()}/400/200` : null
    };
    setNotas([newNota, ...notas]);
    setIsModalOpen(false);
    setFormData({ title: '', content: '' });
  }, [formData, setNotas, notas]);

  const deleteNota = useCallback((id: string) => {
    setNotas(notas.filter((n) => n.id !== id));
  }, [setNotas, notas]);

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Notas" subtitle={`${notas.length} Notas criadas`} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 pb-24">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-bold text-white mb-1">Notas</h2>
            <p className="text-slate-400 font-medium">{notas.length} Notas criadas</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20">
            <span>Nova Nota</span>
          </button>
        </div>

        {notas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <p className="font-mono text-sm uppercase tracking-widest">Nenhuma nota encontrada</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {notas.map(nota => (
            <div key={nota.id} className="group bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-primary transition-all flex flex-col gap-4 relative">
              <button
                onClick={(e) => { e.stopPropagation(); deleteNota(nota.id); }}
                className="absolute top-4 right-4 z-30 p-2 bg-black/50 hover:bg-red-500/80 text-white rounded-full backdrop-blur-md transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
              {nota.image && (
                <div className="w-full h-32 rounded-lg bg-slate-800 overflow-hidden mb-2 relative">
                  <Image src={nota.image} alt={nota.title} fill className="object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors pr-8">{nota.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
                  {nota.content}
                </p>
              </div>
              <div className="mt-auto pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-400 font-medium">{nota.date}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal Nova Nota */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Nota">
        <form onSubmit={handleAddNota} className="space-y-4">
          <FormInput
            label="Título"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ex: Ideias de Projeto"
          />
          <FormTextarea
            label="Conteúdo"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Escreva sua nota aqui..."
          />
          <div className="pt-4">
            <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-colors">
              Salvar Nota
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
