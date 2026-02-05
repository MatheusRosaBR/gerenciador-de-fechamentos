
export const formatCurrencyBRL = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Formats a date string from "DD/MM/YYYY" to "YYYYMMDD" for Google Calendar links.
 * Returns null if the date string is invalid.
 */
export const formatDateForGoogleCalendar = (dateStr: string): string | null => {
  if (!dateStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    return null;
  }
  const [day, month, year] = dateStr.split('/');
  return `${year}${month}${day}`;
};

/**
 * Parses a date string from "DD/MM/YYYY" to a Date object.
 * Returns null if the date string is invalid.
 */
export const parseDateString = (dateStr: string): Date | null => {
  if (!dateStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    return null;
  }
  const [day, month, year] = dateStr.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  // Check if the parsed date is valid and matches the input
  if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
    return date;
  }
  return null;
};

export const formatDateToISO = (dateString: string): string => {
  if (!dateString) return '';
  // Convert DD/MM/YYYY to YYYY-MM-DD
  const parts = dateString.split('/');
  if (parts.length !== 3) return '';
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

export const formatDateFromISO = (isoString: string): string => {
  if (!isoString) return '';
  // Convert YYYY-MM-DD to DD/MM/YYYY
  const parts = isoString.split('-');
  if (parts.length !== 3) return '';
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

export const maskCurrency = (value: string): string => {
  if (!value) return '';
  const numericValue = value.replace(/\D/g, '');
  if (!numericValue) return '';

  // Convert to number (divide by 100 for decimals)
  const number = parseInt(numericValue, 10) / 100;

  return number.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const parseCurrency = (value: string): number => {
  if (!value) return 0;
  // Remove formatting (dots, commas become dots)
  // Standard pt-BR format: 1.000,00 -> swap . for nothing and , for .
  // Or simply remove non-digits then divide by 100
  const numericValue = value.replace(/\D/g, '');
  if (!numericValue) return 0;
  return parseInt(numericValue, 10) / 100;
};

export const maskDate = (value: string): string => {
  let v = value.replace(/\D/g, '').slice(0, 8);
  if (v.length > 5) {
    return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
  } else if (v.length > 2) {
    return `${v.slice(0, 2)}/${v.slice(2)}`;
  }
  return v;
};

export const maskPhone = (value: string): string => {
  let v = value.replace(/\D/g, '').slice(0, 11);
  if (v.length > 10) {
    // (11) 98888-7777
    return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
  } else if (v.length > 6) {
    // (11) 8888-7777 (Landline support or partial mobile)
    return `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
  } else if (v.length > 2) {
    return `(${v.slice(0, 2)}) ${v.slice(2)}`;
  } else if (v.length > 0) {
    return `(${v}`;
  }
  return v;
};
