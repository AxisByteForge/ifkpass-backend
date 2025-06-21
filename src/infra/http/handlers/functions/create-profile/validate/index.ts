import { z } from 'zod';

export const profileValidate = z.object({
  birthDate: z.date(),
  city: z.string().min(1),
  cpf: z.string().min(11).max(14),
  dojo: z.string().min(1),
  rank: z.string().min(1),
  sensei: z.string().min(1),
  photoUrl: z.string().url(),
});
