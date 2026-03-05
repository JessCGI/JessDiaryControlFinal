export const getColorClasses = (color: string, type: 'bg' | 'text' | 'border' | 'bg-opacity' | 'border-opacity') => {
  const colors: Record<string, any> = {
    red: {
      bg: 'bg-red-500',
      text: 'text-red-500',
      border: 'border-red-500',
      'bg-opacity': 'bg-red-500/10',
      'border-opacity': 'border-red-500/20',
    },
    yellow: {
      bg: 'bg-yellow-500',
      text: 'text-yellow-500',
      border: 'border-yellow-500',
      'bg-opacity': 'bg-yellow-500/10',
      'border-opacity': 'border-yellow-500/20',
    },
    emerald: {
      bg: 'bg-emerald-500',
      text: 'text-emerald-500',
      border: 'border-emerald-500',
      'bg-opacity': 'bg-emerald-500/10',
      'border-opacity': 'border-emerald-500/20',
    },
    green: {
      bg: 'bg-green-500',
      text: 'text-green-500',
      border: 'border-green-500',
      'bg-opacity': 'bg-green-500/10',
      'border-opacity': 'border-green-500/20',
    },
    blue: {
      bg: 'bg-blue-500',
      text: 'text-blue-500',
      border: 'border-blue-500',
      'bg-opacity': 'bg-blue-500/10',
      'border-opacity': 'border-blue-500/20',
    },
    purple: {
      bg: 'bg-purple-500',
      text: 'text-purple-500',
      border: 'border-purple-500',
      'bg-opacity': 'bg-purple-500/10',
      'border-opacity': 'border-purple-500/20',
    },
    orange: {
      bg: 'bg-orange-500',
      text: 'text-orange-500',
      border: 'border-orange-500',
      'bg-opacity': 'bg-orange-500/10',
      'border-opacity': 'border-orange-500/20',
    },
    slate: {
      bg: 'bg-slate-500',
      text: 'text-slate-500',
      border: 'border-slate-500',
      'bg-opacity': 'bg-slate-500/10',
      'border-opacity': 'border-slate-500/20',
    },
  };

  return colors[color]?.[type] || colors.slate[type];
};
