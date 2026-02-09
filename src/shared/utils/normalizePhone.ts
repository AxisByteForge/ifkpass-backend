export const normalizePhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};
