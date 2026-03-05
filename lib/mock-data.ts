import { Tarefa, Habito, Projeto, Transacao, Ativo, Nota } from './types';
import { generateId } from './utils';

export const MOCK_TAREFAS: Tarefa[] = [
  { id: '1', title: 'Revisar Protocolo de Segurança', priority: 'Urgente', date: 'Hoje, 18:00', tag: '#Sistemas', completed: false, color: 'red', subtasks: [{ id: '11', title: 'Verificar logs de acesso', completed: true }, { id: '12', title: 'Atualizar chaves SSH', completed: false }] },
  { id: '2', title: 'Relatório Jess Diary Control', priority: 'Média', date: 'Amanhã', tag: '#Documentação', completed: false, color: 'yellow', subtasks: [] },
  { id: '3', title: 'Atualizar Cache do Servidor', priority: 'Baixa', date: '24 Out', tag: '#DevOps', completed: false, color: 'emerald', subtasks: [] },
  { id: '4', title: 'Configurar API de Logs', priority: 'Concluído', date: '', tag: '', completed: true, color: 'slate', subtasks: [] },
];

export const MOCK_HABITOS: Habito[] = [
  { id: '1', title: 'Beber Água (3L)', time: '08:00', frequency: 'Diário', days: [true, true, false, true, true, false, false] },
  { id: '2', title: 'Meditação', time: '07:30', frequency: '5x Semana', days: [true, false, true, true, true, false, false] },
  { id: '3', title: 'Ler 10 páginas', time: '21:00', frequency: 'Diário', days: [true, true, true, true, true, true, true] },
  { id: '4', title: 'Evitar Doces', time: '23:59', frequency: 'Diário', days: [false, false, false, false, false, false, false] },
];

export const MOCK_PROJETOS: Projeto[] = [
  { id: '1', title: 'Residencial Alpha', client: 'Construtora Tech', budget: 'R$ 15.000', progress: 65, status: 'Produção', date: '20 Out', image: 'https://picsum.photos/seed/arch1/600/400', color: 'yellow' },
  { id: '2', title: 'Apartamento Gávea', client: 'Arquiteta Luiza', budget: 'R$ 8.500', progress: 12, status: 'Briefing', date: '05 Nov', image: 'https://picsum.photos/seed/interior1/600/400', color: 'blue' },
  { id: '3', title: 'Cozinha Minimalista', client: 'Studio Design S.P.', budget: 'R$ 4.200', progress: 100, status: 'Entregue', date: '12 Out', image: 'https://picsum.photos/seed/kitchen1/600/400', color: 'green' },
];

export const MOCK_FINANCEIRO: Transacao[] = [
  { id: '1', title: 'Venda de Projeto UI', category: 'Freelance', value: '+ R$ 1.200,00', type: 'income', date: '12 Out' },
  { id: '2', title: 'Assinatura Adobe', category: 'Software', value: '- R$ 124,00', type: 'expense', date: '10 Out' },
  { id: '3', title: 'Energia Elétrica', category: 'Contas', value: '- R$ 342,50', type: 'expense', date: '08 Out' },
];

export const MOCK_INVESTIMENTOS: Ativo[] = [
  { id: '1', ticker: 'BBDC4', type: 'Ações', allocation: 15, invested: 'R$ 4.500', current: 'R$ 5.120', yield: '+13.8%', color: 'blue' },
  { id: '2', ticker: 'BTC', type: 'Cripto', allocation: 12, invested: 'R$ 3.000', current: 'R$ 4.850', yield: '+61.6%', color: 'orange' },
];

export const MOCK_NOTAS: Nota[] = [
  { id: '1', title: 'Planejamento Semanal', content: 'Revisar metas da semana e organizar o cronograma de estudos para as próximas provas. Focar em UI design e acessibilidade na web para os projetos atuais.', date: '12 Out, 2023', image: 'https://picsum.photos/seed/notebook/400/200' },
  { id: '2', title: 'Ideias de Projeto', content: 'Explorar novas paletas de cores e tipografias minimalistas para o redesign do app. Pensar em uma abordagem industrial com foco em tons escuros e texturas brutas.', date: '11 Out, 2023', image: 'https://picsum.photos/seed/desk/400/200' },
  { id: '3', title: 'Diário de Bordo', content: 'Hoje o dia foi produtivo, consegui finalizar as tarefas pendentes e ainda sobrou tempo para pesquisar novas bibliotecas de componentes. A organização está melhorando.', date: '09 Out, 2023', image: null },
];
