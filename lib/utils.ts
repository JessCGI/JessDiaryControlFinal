/**
 * Generates a unique ID.
 * Uses crypto.randomUUID if available, otherwise falls back to a timestamp-based ID.
 */
export function generateId(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Safely parses a currency string into a number.
 * Handles formats like "R$ 1.200,00", "1500.00", etc.
 */
export function parseCurrency(value: string): number {
  if (!value) return 0;
  
  // Remove currency symbols, spaces, and thousand separators
  // For "R$ 1.200,00", we want to end up with "1200.00"
  let cleanValue = value.replace(/[R$\s.]/g, '');
  
  // Replace decimal comma with dot
  cleanValue = cleanValue.replace(',', '.');
  
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formats a number as Brazilian Real currency.
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Safely maps color names to Tailwind color classes to avoid dynamic interpolation issues.
 */
export const colorMap: Record<string, { bg: string, text: string, border: string, bgAlpha: string }> = {
  red: {
    bg: 'bg-red-500',
    text: 'text-red-500',
    border: 'border-red-500',
    bgAlpha: 'bg-red-500/10'
  },
  yellow: {
    bg: 'bg-yellow-500',
    text: 'text-yellow-500',
    border: 'border-yellow-500',
    bgAlpha: 'bg-yellow-500/10'
  },
  emerald: {
    bg: 'bg-emerald-500',
    text: 'text-emerald-500',
    border: 'border-emerald-500',
    bgAlpha: 'bg-emerald-500/10'
  },
  blue: {
    bg: 'bg-blue-500',
    text: 'text-blue-500',
    border: 'border-blue-500',
    bgAlpha: 'bg-blue-500/10'
  },
  purple: {
    bg: 'bg-purple-500',
    text: 'text-purple-500',
    border: 'border-purple-500',
    bgAlpha: 'bg-purple-500/10'
  },
  orange: {
    bg: 'bg-orange-500',
    text: 'text-orange-500',
    border: 'border-orange-500',
    bgAlpha: 'bg-orange-500/10'
  },
  slate: {
    bg: 'bg-slate-500',
    text: 'text-slate-500',
    border: 'border-slate-500',
    bgAlpha: 'bg-slate-500/10'
  },
  green: {
    bg: 'bg-green-500',
    text: 'text-green-500',
    border: 'border-green-500',
    bgAlpha: 'bg-green-500/10'
  }
};
