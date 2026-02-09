import type { Either } from '@/shared/types/either';
import type { Failure } from '@/shared/types/failure.type';

export interface CreateProfileServiceRequest {
  id: string;
  body: {
    birthDate: string;
    city: string;
    cpf: string;
    dojo: string;
    rank: string;
    sensei: string;
    phone: string;
    photoUrl?: string;
  };
}

export interface CreateProfileOutput {
  message: string;
}

export type CreateProfileUseCaseResponse = Either<Failure, CreateProfileOutput>;
