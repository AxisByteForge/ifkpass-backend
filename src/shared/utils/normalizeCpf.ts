export const normalizeCpf = (cpf: string): string => {
  return cpf.replace(/\D/g, '');
};
