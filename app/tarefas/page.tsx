'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { PlusCircle, Trash2, Check, X, Pencil, ChevronDown, ChevronUp, MinusCircle, Loader2 } from 'lucide-react';
import { Tarefa, Subtask } from '@/lib/types';
import { getColorClasses } from '@/utils/colors';
import PageHeader from '@/components/PageHeader';
import { Modal } from '@/components/modal';
import { FormInput, FormSelect } from '@/components/FormInput';
import { createClient } from '@/lib/supabase/client';

export default function Tarefas() {
  const supabase = createClient();
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('Todas');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchTarefas() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }
      setUserId(user.id);

      const { data, error } = await supabase
        .from('tarefas')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setTarefas(data as Tarefa[]);
      }
      setIsLoading(false);
    }
    fetchTarefas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [formData, setFormData] = useState<{
    title: string;
    priority: Tarefa['priority'];
    date: string;
    tag: string;
    subtasks: Subtask[];
  }>({
    title: '',
    priority: 'Média',
    date: '',
    tag: '',
    subtasks: []
  });

  const handleAddTarefa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !userId) return;
    setIsSaving(true);

    let color = 'blue';
    if (formData.priority === 'Urgente') color = 'red';
    if (formData.priority === 'Média') color = 'yellow';
    if (formData.priority === 'Baixa') color = 'emerald';

    if (editingId) {
      const { data, error } = await supabase
        .from('tarefas')
        .update({
          title: formData.title,
          priority: formData.priority,
          date: formData.date,
          tag: formData.tag,
          subtasks: formData.subtasks as any,
          color
        })
        .eq('id', editingId)
        .select()
        .single();

      if (data) {
        setTarefas(tarefas.map(t => t.id === editingId ? data as Tarefa : t));
      }
    } else {
      const newTarefa = {
        title: formData.title,
        priority: formData.priority,
        date: formData.date,
        tag: formData.tag,
        subtasks: formData.subtasks as any,
        color,
        completed: false,
        user_id: userId
      };

      const { data, error } = await supabase
        .from('tarefas')
        .insert([newTarefa])
        .select()
        .single();

      if (data) {
        setTarefas([data as Tarefa, ...tarefas]);
      }
    }

    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ title: '', priority: 'Média', date: '', tag: '', subtasks: [] });
    setIsSaving(false);
  };

  const handleEdit = useCallback((tarefa: Tarefa) => {
    setEditingId(tarefa.id);
    setFormData({
      title: tarefa.title,
      priority: tarefa.priority,
      date: tarefa.date || '',
      tag: tarefa.tag || '',
      subtasks: tarefa.subtasks || []
    });
    setIsModalOpen(true);
  }, []);

  const addSubtaskField = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, { id: crypto.randomUUID(), title: '', completed: false }]
    }));
  }, []);

  const removeSubtaskField = useCallback((id: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(s => s.id !== id)
    }));
  }, []);

  const updateSubtaskField = useCallback((id: string, title: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(s => s.id === id ? { ...s, title } : s)
    }));
  }, []);

  const toggleSubtask = async (tarefaId: string, subtaskId: string) => {
    const tarefa = tarefas.find(t => t.id === tarefaId);
    if (!tarefa || !tarefa.subtasks) return;

    // Optimistic UI updates
    const updatedSubtasks = tarefa.subtasks.map((s) => s.id === subtaskId ? { ...s, completed: !s.completed } : s);
    setTarefas(tarefas.map((t) => t.id === tarefaId ? { ...t, subtasks: updatedSubtasks } : t));

    // DB Update
    await supabase.from('tarefas').update({ subtasks: updatedSubtasks as any }).eq('id', tarefaId);
  };

  const deleteTarefa = async (id: string) => {
    setTarefas(tarefas.filter((t) => t.id !== id));
    setConfirmDeleteId(null);
    await supabase.from('tarefas').delete().eq('id', id);
  };

  const toggleTarefa = async (id: string) => {
    const tarefa = tarefas.find(t => t.id === id);
    if (!tarefa) return;

    const newStatus = !tarefa.completed;
    const newPriority = newStatus ? 'Concluído' : 'Média';

    setTarefas(tarefas.map((t) => t.id === id ? { ...t, completed: newStatus, priority: newPriority } : t));
    await supabase.from('tarefas').update({ completed: newStatus, priority: newPriority }).eq('id', id);
  };

  const filteredTarefas = useMemo(() => {
    return tarefas.filter((t) => {
      if (activeFilter === 'Pendentes') return !t.completed;
      if (activeFilter === 'Alta Prioridade') return t.priority === 'Urgente' && !t.completed;
      if (activeFilter === 'Concluídas') return t.completed;
      return true;
    });
  }, [tarefas, activeFilter]);

  const pendingCount = useMemo(() => tarefas.filter((t) => !t.completed).length, [tarefas]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ title: '', priority: 'Média', date: '', tag: '', subtasks: [] });
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative">
      <PageHeader title="Tarefas" subtitle={`${pendingCount} Pendentes`} />

      <div className="px-6 pt-4">
        <button onClick={() => setIsModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-primary-purple hover:bg-primary-purple/90 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary-purple/20">
          <PlusCircle size={20} />
          <span>Nova Tarefa</span>
        </button>
      </div>

      <nav className="flex gap-3 px-6 py-4 overflow-x-auto no-scrollbar">
        {['Todas', 'Pendentes', 'Alta Prioridade', 'Concluídas'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`flex shrink-0 items-center justify-center px-5 py-2 rounded-full text-sm font-medium transition-colors ${activeFilter === filter
              ? 'bg-primary-purple text-white'
              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
              }`}
          >
            {filter}
          </button>
        ))}
      </nav>

      <main className="flex-1 px-6 space-y-4 pb-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="animate-spin mb-2" size={24} />
            <p className="font-mono text-sm uppercase tracking-widest">Carregando...</p>
          </div>
        ) : filteredTarefas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <p className="font-mono text-sm uppercase tracking-widest">Nenhuma tarefa encontrada</p>
          </div>
        ) : (
          filteredTarefas.map((tarefa) => {
            const colorClasses = getColorClasses(tarefa.color || 'blue', 'text');
            const borderClasses = getColorClasses(tarefa.color || 'blue', 'border');
            const bgAlphaClasses = getColorClasses(tarefa.color || 'blue', 'bg');

            return (
              <div key={tarefa.id} className="flex flex-col gap-2">
                <div className={`bg-slate-900/${tarefa.completed ? '20' : '50'} border-l-4 ${tarefa.completed ? 'border-slate-700' : borderClasses} rounded-lg p-4 shadow-sm flex items-start gap-4 ${tarefa.completed ? 'opacity-60' : ''}`}>
                  <div className="pt-1">
                    <div onClick={() => toggleTarefa(tarefa.id)} className={`w-6 h-6 ${tarefa.completed ? 'bg-primary-purple' : 'border-2 border-slate-600'} rounded-md flex items-center justify-center cursor-pointer`}>
                      {tarefa.completed && <Check size={16} className="text-white" />}
                    </div>
                  </div>
                  <div className="flex-1 cursor-pointer" onClick={() => setExpandedTaskId(expandedTaskId === tarefa.id ? null : tarefa.id)}>
                    <div className="flex items-center gap-2">
                      <h4 className={`font-bold text-slate-100 ${tarefa.completed ? 'line-through' : ''}`}>{tarefa.title}</h4>
                      {tarefa.subtasks && tarefa.subtasks.length > 0 && (
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                          {tarefa.subtasks.filter((s) => s.completed).length}/{tarefa.subtasks.length}
                        </span>
                      )}
                      {tarefa.subtasks && tarefa.subtasks.length > 0 && (
                        expandedTaskId === tarefa.id ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded ${tarefa.completed ? 'bg-slate-800 text-slate-400 border-slate-700' : `${bgAlphaClasses} ${colorClasses} ${borderClasses}/20`} border uppercase font-bold`}>
                        {tarefa.completed ? 'Concluído' : tarefa.priority}
                      </span>
                      {!tarefa.completed && tarefa.date && <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">{tarefa.date}</span>}
                      {!tarefa.completed && tarefa.tag && <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-primary-purple/10 text-primary-purple border border-primary-purple/20">{tarefa.tag}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(tarefa)} className="text-slate-400 hover:text-primary-purple transition-colors">
                      <Pencil size={18} />
                    </button>

                    {confirmDeleteId === tarefa.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => deleteTarefa(tarefa.id)} className="bg-red-500 text-white text-[10px] px-2 py-1 rounded font-bold">Confirmar</button>
                        <button onClick={() => setConfirmDeleteId(null)} className="text-slate-400 p-1"><X size={14} /></button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(tarefa.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Subtasks Display */}
                {expandedTaskId === tarefa.id && tarefa.subtasks && tarefa.subtasks.length > 0 && (
                  <div className="ml-10 space-y-2 pb-2">
                    {tarefa.subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center gap-3 bg-slate-900/30 p-2 rounded-md border border-slate-800/50">
                        <div
                          onClick={() => toggleSubtask(tarefa.id, subtask.id)}
                          className={`w-4 h-4 ${subtask.completed ? 'bg-primary-purple' : 'border border-slate-600'} rounded flex items-center justify-center cursor-pointer`}
                        >
                          {subtask.completed && <Check size={10} className="text-white" />}
                        </div>
                        <span className={`text-xs text-slate-300 ${subtask.completed ? 'line-through opacity-50' : ''}`}>
                          {subtask.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </main>

      {/* Modal Nova Tarefa */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? 'Editar Tarefa' : 'Nova Tarefa'}>
        <form onSubmit={handleAddTarefa} className="space-y-4">
          <FormInput
            label="Título"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ex: Revisar relatório..."
          />
          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Prioridade"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as Tarefa['priority'] })}
            >
              <option value="Urgente">Urgente</option>
              <option value="Média">Média</option>
              <option value="Baixa">Baixa</option>
            </FormSelect>
            <FormInput
              label="Data/Hora"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              placeholder="Ex: Hoje, 18:00"
            />
          </div>
          <FormInput
            label="Tag"
            value={formData.tag}
            onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
            placeholder="Ex: #Trabalho"
          />

          {/* Subtasks Section in Modal */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider">Subtarefas</label>
              <button
                type="button"
                onClick={addSubtaskField}
                className="text-primary-purple hover:text-primary-purple/80 flex items-center gap-1 text-[10px] font-bold uppercase"
              >
                <PlusCircle size={14} />
                Adicionar
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 no-scrollbar">
              {formData.subtasks.map((subtask, index) => (
                <div key={subtask.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={subtask.title}
                    onChange={(e) => updateSubtaskField(subtask.id, e.target.value)}
                    className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-purple transition-colors"
                    placeholder={`Subtarefa ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeSubtaskField(subtask.id)}
                    className="text-slate-500 hover:text-red-500 transition-colors"
                  >
                    <MinusCircle size={18} />
                  </button>
                </div>
              ))}
              {formData.subtasks.length === 0 && (
                <p className="text-[10px] text-slate-600 italic text-center py-2">Nenhuma subtarefa adicionada.</p>
              )}
            </div>
          </div>

          <button disabled={isSaving} type="submit" className="w-full bg-primary-purple hover:bg-primary-purple/90 disabled:opacity-50 text-white font-bold py-3 rounded-lg mt-4 transition-colors">
            {isSaving ? <Loader2 className="animate-spin text-white flex mx-auto" size={20} /> : 'Salvar Tarefa'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
