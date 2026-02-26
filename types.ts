
export enum Gender {
  MASCULINO = 'Masculino',
  FEMININO = 'Feminino'
}

export enum SkillLevel {
  CASUAL = 'Casual',
  INTERMEDIARIO = 'Intermediário',
  PRO = 'Nível Pro',
  CAPITAO = 'Capitão'
}

export interface PlayerSkills {
  ataque: number;
  defesa: number;
  recepcao: number;
  levantamento: number;
  saque: number;
  bloqueio: number;
}

export const SKILL_LABELS: Record<keyof PlayerSkills, string> = {
  ataque: 'Ataque',
  defesa: 'Defesa',
  recepcao: 'Recepção',
  levantamento: 'Levantamento',
  saque: 'Saque',
  bloqueio: 'Bloqueio',
};

export interface Player {
  id: string;
  user_id?: string;
  name: string;
  gender: Gender;
  rating: number;
  level: SkillLevel;
  avatarUrl: string;
  isMVP?: boolean;
  skills: PlayerSkills;
}

export interface UserProfile {
  id: string;
  user_id?: string;
  name: string;
  gender: Gender;
  level: SkillLevel;
  avatarUrl: string;
  bio: string;
  age?: number;
  phone?: string;
}

export interface Payment {
  id: string;
  player_id: string;
  user_id: string;
  month: number;
  year: number;
  is_paid: boolean;
  amount?: number;
  created_at?: string;
}

export interface CashTransaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  type: 'deposit' | 'withdrawal';
  date: string;
  created_at?: string;
}

export type ViewType = 'players' | 'draw' | 'stats' | 'settings' | 'profile' | 'download' | 'finance';

export interface HistoryItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: 'Pagamento' | 'Retirada' | 'Depósito' | 'Geral';
}
