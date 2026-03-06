'use client';

import { useState, useCallback, useEffect } from 'react';
import { Box, Plus, Calendar, CheckCircle, Trash2, Edit2, ListChecks, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Projeto, ProjectStatus, PipelineStep } from '@/lib/types';
import { generateId } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';
import { Modal } from '@/components/modal';
import { FormInput, FormSelect } from '@/components/FormInput';
import EmptyState from '@/components/EmptyState';
import { createClient } from '@/lib/supabase/client';

const STATUS_COLORS: Record<string, string> = {
  'Briefing': 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  'Produção': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  'Revisão': 'bg-orange-500/20 text-orange-500 border-orange-500/30',
  'Entregue': 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
};

const COLOR_VARIANTS: Record<string, string> = {
  'blue': 'text-blue-500 border-blue-500/30',
  'yellow': 'text-yellow-500 border-yellow-500/30',
  'green': 'text-emerald-500 border-emerald-500/30',
  'purple': 'text-purple-500 border-purple-500/30',
  'orange': 'text-orange-500 border-orange-500/30',
};

const PROGRESS_COLORS: Record<string, string> = {
  'blue': 'bg-blue-500',
  'yellow': 'bg-yellow-500',
  'green': 'bg-emerald-500',
  'purple': 'bg-purple-500',
  'orange': 'bg-orange-500',
};

export default function Projetos() {
  const supabase = createClient();
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newProjeto, setNewProjeto] = useState({
    title: '', client: '', budget: '', status: 'Briefing' as ProjectStatus,
    progress: '0', date: '', color: 'blue', pipeline: [] as PipelineStep[]
  });
  const [newStepTitle, setNewStepTitle] = useState('');

  useEffect(() => {
    async function fetchProjetos() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }
      setUserId(user.id);

      const { data, error } = await supabase
        .from('projetos')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setProjetos(data as Projeto[]);
      }
      setIsLoading(false);
    }
    fetchProjetos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openNewModal = () => {
    setEditingId(null);
    setNewProjeto({ title: '', client: '', budget: '', status: 'Briefing', progress: '0', date: '', color: 'blue', pipeline: [] });
    setNewStepTitle('');
    setIsModalOpen(true);
  };

  const openEditModal = (projeto: Projeto) => {
    setEditingId(projeto.id);
    setNewProjeto({
      title: projeto.title,
      client: projeto.client || '',
      budget: projeto.budget || '',
      status: (projeto.status as ProjectStatus) || 'Briefing',
      progress: (projeto.progress || 0).toString(),
      date: projeto.date || '',
      color: projeto.color || 'blue',
      pipeline: projeto.pipeline || []
    });
    setNewStepTitle('');
    setIsModalOpen(true);
  };

  const saveProjeto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjeto.title.trim() || !userId) return;
    setIsSaving(true);

    // Auto calculate progress if there is a pipeline
    let finalProgress = parseInt(newProjeto.progress) || 0;
    const pipeline = newProjeto.pipeline || [];
    if (pipeline.length > 0) {
      const completedCount = pipeline.filter(s => s.completed).length;
      finalProgress = Math.round((completedCount / pipeline.length) * 100);
    }

    let finalStatus = newProjeto.status;
    if (finalProgress === 100) finalStatus = 'Entregue';

    const projetoData = {
      title: newProjeto.title,
      client: newProjeto.client || 'Novo Cliente',
      budget: newProjeto.budget || 'R$ 0',
      progress: finalProgress,
      status: finalStatus,
      date: newProjeto.date || 'A definir',
      image: editingId ? (projetos.find(p => p.id === editingId)?.image || `https://picsum.photos/seed/${crypto.randomUUID()}/600/400`) : `https://picsum.photos/seed/${crypto.randomUUID()}/600/400`,
      color: newProjeto.color,
      pipeline: pipeline as any,
      user_id: userId
    };

    if (editingId) {
      const { data } = await supabase.from('projetos').update(projetoData).eq('id', editingId).select().single();
      if (data) setProjetos(projetos.map(p => p.id === editingId ? data as Projeto : p));
    } else {
      const { data } = await supabase.from('projetos').insert([projetoData]).select().single();
      if (data) setProjetos([data as Projeto, ...projetos]);
    }

    setIsModalOpen(false);
    setIsSaving(false);
  };

  const deleteProjeto = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      setProjetos(projetos.filter((p) => p.id !== id));
      await supabase.from('projetos').delete().eq('id', id);
    }
  };

  const togglePipelineStep = async (projectId: string, stepId: string) => {
    const p = projetos.find(proj => proj.id === projectId);
    if (!p || !p.pipeline) return;

    const updatedPipeline = p.pipeline.map(step =>
      step.id === stepId ? { ...step, completed: !step.completed } : step
    );

    const completedCount = updatedPipeline.filter(s => s.completed).length;
    const totalCount = updatedPipeline.length;
    const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : (p.progress || 0);

    let newStatus = p.status || 'Briefing';
    if (newProgress === 100) newStatus = 'Entregue';
    else if (newProgress > 0 && newProgress < 100 && p.status === 'Briefing') newStatus = 'Produção';

    setProjetos(projetos.map(proj => proj.id === projectId ? { ...proj, pipeline: updatedPipeline as any, progress: newProgress, status: newStatus as any } : proj));

    await supabase.from('projetos').update({
      pipeline: updatedPipeline as any,
      progress: newProgress,
      status: newStatus
    }).eq('id', projectId);
  };

  const addPipelineStepInModal = () => {
    if (!newStepTitle.trim()) return;
    setNewProjeto(prev => ({
      ...prev,
      pipeline: [...(prev.pipeline || []), { id: crypto.randomUUID(), title: newStepTitle, completed: false }]
    }));
    setNewStepTitle('');
  };

  const removePipelineStepInModal = (stepId: string) => {
    setNewProjeto(prev => ({
      ...prev,
      pipeline: prev.pipeline?.filter(s => s.id !== stepId) || []
    }));
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      <PageHeader title="Projetos 3D" subtitle="Pipeline" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 pb-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">X Assets</h2>
            <p className="text-slate-400">Gerenciamento de pipeline e entregas 3D</p>
          </div>
          <button onClick={openNewModal} className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20">
            <Plus size={20} />
            Novo Projeto
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500">
              <Loader2 className="animate-spin mb-2" size={24} />
              <p className="font-mono text-sm uppercase tracking-widest">Carregando...</p>
            </div>
          ) : projetos.length === 0 ? (
            <div className="col-span-full">
              <EmptyState icon={<Box size={48} />} message="Nenhum projeto encontrado" />
            </div>
          ) : (
            projetos.map((projeto) => (
              <div key={projeto.id} className="bg-card-dark border border-slate-800 rounded-xl overflow-hidden flex flex-col hover:border-primary/50 transition-colors group relative">
                <button
                  onClick={(e) => { e.stopPropagation(); deleteProjeto(projeto.id); }}
                  className="absolute top-3 left-3 z-30 p-2 bg-black/50 hover:bg-red-500/80 text-white rounded-full backdrop-blur-md transition-colors opacity-80 hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); openEditModal(projeto); }}
                  className="absolute top-3 left-12 z-30 p-2 bg-black/50 hover:bg-blue-500/80 text-white rounded-full backdrop-blur-md transition-colors opacity-80 hover:opacity-100"
                >
                  <Edit2 size={16} />
                </button>
                <div className="h-48 bg-slate-900 relative overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                  {projeto.image && <Image src={projeto.image} alt={projeto.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />}
                  <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
                    <span className={`backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${STATUS_COLORS[projeto.status || 'Briefing']} ${COLOR_VARIANTS[projeto.color || 'blue']} `}>
                      {projeto.status}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      {projeto.progress === 100 ? <CheckCircle size={12} /> : <Calendar size={12} />}
                      {projeto.progress === 100 ? 'Finalizado' : 'Prazo'}: {projeto.date}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl mb-4 text-slate-100 leading-none uppercase font-extrabold tracking-tighter">{projeto.title}</h3>

                  {/* Informações base */}
                  <div className="flex justify-between text-sm mb-4">
                    <span className="text-slate-400 italic">{projeto.client}</span>
                    <span className="font-bold text-primary">{projeto.budget}</span>
                  </div>

                  {/* Pipeline Interativa no Card */}
                  {projeto.pipeline && projeto.pipeline.length > 0 && (
                    <div className="mt-2 mb-4 space-y-2 border-t border-slate-800/50 pt-3">
                      <div className="flex items-center gap-1.5 text-slate-400 mb-2">
                        <ListChecks size={14} />
                        <span className="text-xs font-bold uppercase tracking-wider">Pipeline</span>
                      </div>
                      <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                        {projeto.pipeline.map(step => (
                          <label key={step.id} className="flex items-start gap-2.5 group/step cursor-pointer text-sm p-1 hover:bg-white/5 rounded-md transition-colors">
                            <div className="relative flex flex-shrink-0 items-center justify-center mt-0.5">
                              <input
                                type="checkbox"
                                checked={step.completed}
                                onChange={() => togglePipelineStep(projeto.id, step.id)}
                                className="peer appearance-none size-4 rounded bg-slate-800 border border-slate-600 checked:bg-primary checked:border-primary transition-all cursor-pointer"
                              />
                              <CheckCircle size={12} strokeWidth={3} className="absolute text-background opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                            <span className={`transition-all mt-0.5 leading-tight ${step.completed ? 'text-slate-500 line-through' : 'text-slate-200 group-hover/step:text-white'}`}>
                              {step.title}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-auto pt-2 border-t border-slate-800/30">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Progresso</span>
                        <span className="text-xs font-bold text-slate-300">{projeto.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${PROGRESS_COLORS[projeto.color || 'blue']} transition-all duration-500`} style={{ width: `${projeto.progress || 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal Novo/Editar Projeto */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar Projeto" : "Novo Projeto"}>
        <form onSubmit={saveProjeto} className="space-y-4">
          <FormInput
            label="Nome do Projeto"
            required
            value={newProjeto.title}
            onChange={(e) => setNewProjeto({ ...newProjeto, title: e.target.value })}
            placeholder="Ex: Residencial Alpha"
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Cliente"
              value={newProjeto.client}
              onChange={(e) => setNewProjeto({ ...newProjeto, client: e.target.value })}
              placeholder="Ex: Construtora Tech"
            />
            <FormInput
              label="Orçamento"
              value={newProjeto.budget}
              onChange={(e) => setNewProjeto({ ...newProjeto, budget: e.target.value })}
              placeholder="Ex: R$ 15.000"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Status"
              value={newProjeto.status}
              onChange={(e) => setNewProjeto({ ...newProjeto, status: e.target.value as ProjectStatus })}
            >
              <option value="Briefing">Briefing</option>
              <option value="Produção">Produção</option>
              <option value="Revisão">Revisão</option>
              <option value="Entregue">Entregue</option>
            </FormSelect>
            <FormInput
              label="Progresso (%) - Automático se houver Pipeline"
              type="number"
              min="0"
              max="100"
              disabled={newProjeto.pipeline && newProjeto.pipeline.length > 0}
              value={newProjeto.progress}
              onChange={(e) => setNewProjeto({ ...newProjeto, progress: e.target.value })}
              placeholder="Ex: 50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Prazo"
              value={newProjeto.date}
              onChange={(e) => setNewProjeto({ ...newProjeto, date: e.target.value })}
              placeholder="Ex: 20 Out"
            />
            <FormSelect
              label="Cor de Destaque"
              value={newProjeto.color}
              onChange={(e) => setNewProjeto({ ...newProjeto, color: e.target.value })}
            >
              <option value="blue">Azul</option>
              <option value="yellow">Amarelo</option>
              <option value="green">Verde</option>
              <option value="purple">Roxo</option>
              <option value="orange">Laranja</option>
            </FormSelect>
          </div>

          {/* Pipeline Section */}
          <div className="col-span-full mt-6 space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <ListChecks size={18} className="text-primary-purple" />
              <h4 className="font-bold text-sm uppercase tracking-wider text-slate-200">Pipeline (Passos do Projeto)</h4>
            </div>

            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <FormInput
                  label=""
                  value={newStepTitle}
                  onChange={(e) => setNewStepTitle(e.target.value)}
                  placeholder="Ex: Modelagem 3D, Texturização..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPipelineStepInModal())}
                />
              </div>
              <button
                type="button"
                onClick={addPipelineStepInModal}
                className="bg-primary hover:bg-primary/90 text-white h-[48px] w-[56px] rounded-xl flex items-center justify-center transition-colors shadow-lg mt-1"
                title="Adicionar passo"
              >
                <Plus size={24} />
              </button>
            </div>

            {newProjeto.pipeline && newProjeto.pipeline.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar mt-4">
                {newProjeto.pipeline.map((step) => (
                  <div key={step.id} className="flex justify-between items-center bg-background/80 p-3 rounded-lg border border-slate-800/80 group">
                    <span className="text-sm font-medium text-slate-300">{step.title}</span>
                    <button
                      type="button"
                      onClick={() => removePipelineStepInModal(step.id)}
                      className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-md transition-colors opacity-80 hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {newProjeto.pipeline && newProjeto.pipeline.length === 0 && (
              <p className="text-xs text-slate-500 italic mt-2">Nenhum passo adicionado. O progresso será manual.</p>
            )}
          </div>

          <div className="pt-4">
            <button disabled={isSaving} type="submit" className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-primary/20">
              {isSaving ? <Loader2 className="animate-spin text-white flex mx-auto" size={20} /> : (editingId ? "Salvar Alterações" : "Criar Projeto")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
