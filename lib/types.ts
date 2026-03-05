import { Database } from './database.types'

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Re-export old types but map them to the DB where needed.
export type ProjectStatus = 'Briefing' | 'Produção' | 'Revisão' | 'Entregue';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface PipelineStep {
  id: string;
  title: string;
  completed: boolean;
}

export type Tarefa = Tables<'tarefas'> & { subtasks: Subtask[] | null }
export type Projeto = Tables<'projetos'> & { pipeline: PipelineStep[] | null }
export type Habito = Tables<'habitos'>
export type Transacao = Tables<'transacoes'>
export type Nota = Tables<'notas'>
export type Ativo = Tables<'ativos'>
export type Conta = Tables<'contas'>
