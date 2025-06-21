import { Either } from '../../../domain/either';

export interface CreateProfileUseCaseRequest {
  headers: {
    Authorization?: string;
  };
  body: {
    birthDate: Date;
    city: string;
    cpf: string;
    dojo: string;
    rank: string;
    sensei: string;
    photoUrl: string;
  };
}

export type CreateProfileUseCaseResponse = Either<null, object>;
