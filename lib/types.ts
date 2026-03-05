export type Priority = 'Urgente' | 'Média' | 'Baixa' | 'Concluído';
export type ProjectStatus = 'Briefing' | 'Produção' | 'Revisão' | 'Entregue';
export type TransactionType = 'income' | 'expense';

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

export interface Tarefa {
  id: string;
  title: string;
  priority: Priority;
  date: string;
  tag: string;
  completed: boolean;
  color: string;
  subtasks: Subtask[];
}

export interface Habito {
  id: string;
  title: string;
  time: string;
  frequency: string;
  days: boolean[]; // 7 days of the week
}

export interface Projeto {
  id: string;
  title: string;
  client: string;
  budget: string;
  progress: number;
  status: ProjectStatus;
  date: string;
  image: string;
  color: string;
  pipeline?: PipelineStep[];
}

export interface Nota {
  id: string;
  title: string;
  content: string;
  date: string;
  image: string | null;
}

export interface Ativo {
  id: string;
  ticker: string;
  type: string;
  allocation: number;
  invested: string;
  current: string;
  yield: string;
  color: string;
}

export interface Transacao {
  id: string;
  title: string;
  category: string;
  value: string;
  type: TransactionType;
  date: string;
}
