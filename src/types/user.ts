/**
 * Tipos e interfaces para o sistema de usuários
 * Define todas as estruturas de dados relacionadas aos usuários
 */

// ===== TIPOS BÁSICOS =====

/**
 * Enum para gêneros de usuário
 * Garante consistência nos valores aceitos
 */
export type UserGender = 'male' | 'female';

/**
 * Enum para roles/perfis de usuário
 * Define os níveis de acesso no sistema
 */
export type UserRole = 'admin' | 'user' | 'moderator';

/**
 * Interface para coordenadas geográficas
 * Usada em endereços e localizações
 */
export interface GeographicCoordinates {
  lat: number;
  lng: number;
}

/**
 * Interface para informações de cabelo
 * Detalhes físicos do usuário
 */
export interface HairInformation {
  color?: string;
  type?: string;
}

/**
 * Interface para endereço completo
 * Inclui informações de localização e coordenadas
 */
export interface UserAddress {
  address?: string;
  city?: string;
  state?: string;
  stateCode?: string;
  postalCode?: string;
  coordinates?: GeographicCoordinates;
  country?: string;
}

/**
 * Interface para informações bancárias
 * Dados financeiros do usuário
 */
export interface BankInformation {
  cardExpirationDate?: string;
  cardNumber?: string;
  cardType?: string;
  currency?: string;
  iban?: string;
}

/**
 * Interface para informações da empresa
 * Dados profissionais do usuário
 */
export interface CompanyInformation {
  department?: string;
  name?: string;
  title?: string;
  address?: UserAddress;
}

// ===== INTERFACES PRINCIPAIS =====

/**
 * Interface básica para usuários
 * Usada em tabelas, listas e operações básicas
 * Contém apenas os dados essenciais para exibição
 */
export interface UserBasicInfo {
  readonly id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  gender: UserGender;
  profileImageUrl: string;
  role: UserRole;
}

/**
 * Interface completa para detalhes do usuário
 * Estende UserBasicInfo com informações adicionais
 * Usada na página de detalhes do usuário
 */
export interface UserDetailedInfo extends UserBasicInfo {
  age?: number;
  birthDate?: string;
  phoneNumber?: string;
  bloodGroup?: string;
  height?: number;
  weight?: number;
  eyeColor?: string;
  hair?: HairInformation;
  address?: UserAddress;
  bank?: BankInformation;
  company?: CompanyInformation;
  // Propriedade adicional para compatibilidade
  image?: string;
}

/**
 * Interface para estatísticas de usuários
 * Agregações e contadores para dashboard
 */
export interface UserStatistics {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
  moderatorUsers: number;
}

/**
 * Interface para dados de formulário de usuário
 * Usada nos modais de criação e edição
 * Campos opcionais para diferentes contextos
 */
export interface UserFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password?: string; // Obrigatório apenas na criação
  age?: number;
  gender: UserGender;
  role: UserRole;
}

// ===== TIPOS PARA RESPONSES DA API =====

/**
 * Interface para resposta da API de usuários
 * Estrutura padrão retornada pelos endpoints
 */
export interface UsersApiResponse {
  users: UserBasicInfo[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * Interface para resposta de operações CRUD
 * Confirmação de ações como criar, editar, deletar
 */
export interface UserOperationResponse {
  success: boolean;
  message: string;
  data?: UserBasicInfo;
}

// ===== ALIASES PARA COMPATIBILIDADE =====
// Mantidos para não quebrar código existente

/** @deprecated Use UserBasicInfo em vez disso */
export type UserData = UserBasicInfo;

/** @deprecated Use UserDetailedInfo em vez disso */
export type UserDetails = UserDetailedInfo;

/** @deprecated Use UserStatistics em vez disso */
export type UserStats = UserStatistics;

/** @deprecated Use UserFormData em vez disso */
export type UserFormValues = UserFormData;
