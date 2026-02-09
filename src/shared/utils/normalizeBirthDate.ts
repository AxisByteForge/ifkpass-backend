export const normalizeBirthDate = (birthDate: string): string => {
  // Remove all non-digit characters except hyphen
  const cleaned = birthDate.replace(/[^\d-]/g, '');

  // If already in ISO format (YYYY-MM-DD), return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }

  // Extract digits only for parsing DD/MM/YYYY or DD-MM-YYYY formats
  const digitsOnly = birthDate.replace(/\D/g, '');

  // Expected format: DDMMYYYY (8 digits)
  if (digitsOnly.length === 8) {
    const day = digitsOnly.substring(0, 2);
    const month = digitsOnly.substring(2, 4);
    const year = digitsOnly.substring(4, 8);
    return `${year}-${month}-${day}`;
  }

  // If format is not recognized, return as is
  return birthDate;
};
