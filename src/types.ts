export enum ReceiptStatus {
  Sim = "Sim",
  Nao = "Não",
}

export enum ContractStatus {
  Documentacao = "Documentação",
  Analise = "Análise",
  Contrato = "Contrato",
  Assinado = "Assinado",
}

export interface Contract {
  id: string;
  imovel: string;
  cliente: string;
  valorLocacao: number;
  comissao: number;
  percentualComissao: number;
  statusRecebimento: ReceiptStatus;
  statusContrato: ContractStatus;
  formalizacao: string; // e.g., "15/10/2025"
  dataRecebimento: string; // e.g., "20/10/2025"
  telefone?: string;
  email?: string;
  lembreteAtivo?: boolean;
  aliquotaImposto?: number;
  comissaoLiquida?: number;
}

export enum SaleStatus {
  Proposta = "Proposta",
  Financiamento = "Financiamento",
  Escritura = "Escritura",
  Vendido = "Vendido",
}

export interface SaleContract {
  id: string;
  imovel: string;
  cliente: string;
  valorVenda: number;
  comissao: number;
  percentualComissao: number;
  statusRecebimento: ReceiptStatus;
  statusVenda: SaleStatus;
  dataVenda: string;
  dataRecebimento: string;
  telefone?: string;
  email?: string;
  lembreteAtivo?: boolean;
  aliquotaImposto?: number;
  comissaoLiquida?: number;
}

export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  twoFactorEnabled: boolean;
  avatar?: string; // Base64 encoded image
}

// Database-backed user profile
export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  avatar?: string;
  phone: string;
  rental_goal: number;
  sales_goal: number;
  theme_name: string;
  has_seen_onboarding: boolean;
  two_factor_enabled: boolean;
  created_at: string;
  updated_at: string;
}