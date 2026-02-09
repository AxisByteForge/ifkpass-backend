import type { Either } from '@/shared/types/either';
import type { Failure } from '@/shared/types/failure.type';

export interface PayCardServiceRequest {
  userId: string;
  action: 'create' | 'generate-checkout' | 'complete-payment';
  paymentStatus?: 'approved' | 'pending' | 'rejected';
  paymentId?: string;
}

export enum UserStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export type BeltCategory = 'colored' | 'black';

export enum KarateRank {
  BRANCA = 'Branca',
  AMARELA = 'Amarela',
  LARANJA = 'Laranja',
  VERDE = 'Verde',
  AZUL = 'Azul',
  MARROM = 'Marrom',
  PRETA = 'Preta',
  VERMELHA = 'Vermelha'
}

export interface PayCardOutput {
  checkoutUrl?: string;
  sandBoxUrl?: string;
  message?: string;
}

export type PayCardUseCaseResponse = Either<Failure, PayCardOutput>;
