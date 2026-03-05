'use client';

import { useState, useCallback, useEffect } from 'react';
import { Trash2, Loader2, Plus } from 'lucide-react';
import { Nota } from '@/lib/types';
import PageHeader from '@/components/PageHeader';
import { Modal } from '@/components/modal';
import { FormInput, FormTextarea } from '@/components/FormInput';
import EmptyState from '@/components/EmptyState';
import { createClient } from '@/lib/supabase/client';

export default function Notas() {
  const supabase = createClient();
  const [notas, setNotas] = useState<Nota[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });

  useEffect(() => {
    async function fetchNotas() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }
      setUserId(user.id);

      const { data } = await supabase
        .from('notas')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setNotas(data as Nota[]);
      }
      setIsLoading(false);
    }
    fetchNotas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddNota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !userId) return;
    setIsSaving(true);

    const newNota = {
      title: formData.title,
      content: formData.content || '',
      date: 'Hoje',
      user_id: userId
    };

    const { data } = await supabase.from('notas').insert([newNota]).select().single();
    if (data) {
      setNotas([data as Nota, ...notas]);
    }

    setIsModalOpen(false);
    setFormData({ title: '', content: '' });
    setIsSaving(false);
  };

  const deleteNota = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta nota?')) {
      setNotas(notas.filter((n) => n.id !== id));
      await supabase.from('notas').delete().eq('id', id);
    }
  };

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
            <Plus size={20} />
            <span>Nova Nota</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="animate-spin mb-2" size={24} />
            <p className="font-mono text-sm uppercase tracking-widest">Carregando...</p>
          </div>
        ) : notas.length === 0 ? (
          <div className="col-span-full">
            <EmptyState icon={<Plus size={48} />} message="Nenhuma nota encontrada" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {notas.map(nota => (
              <div key={nota.id} className="group bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-primary/50 transition-all flex flex-col gap-4 relative">
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNota(nota.id); }}
                  className="absolute top-4 right-4 z-30 p-2 bg-black/50 hover:bg-red-500/80 text-white rounded-full backdrop-blur-md transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
                <div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors pr-8">{nota.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                    {nota.content}
                  </p>
                </div>
                <div className="mt-auto pt-4 border-t border-slate-800">
                  <span className="text-xs text-slate-500 font-medium">Data: {nota.date || 'Hoje'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
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
            <button disabled={isSaving} type="submit" className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors">
              {isSaving ? <Loader2 className="animate-spin text-white flex mx-auto" size={20} /> : 'Salvar Nota'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
