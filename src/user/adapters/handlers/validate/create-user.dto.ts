import { z } from 'zod';

export const registerDto = z.object({
  name: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  password: z.string(),
  phone: z.string(),
});
