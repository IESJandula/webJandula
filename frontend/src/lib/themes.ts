export function getCaminoTheme(color: string) {
  switch (color) {
    case 'blue-500':
      return {
        badge: 'bg-blue-50 text-blue-700',
        title: 'text-blue-700',
        ring: 'group-hover:ring-blue-500/20',
      };
    case 'green-500':
      return {
        badge: 'bg-emerald-50 text-emerald-700',
        title: 'text-emerald-700',
        ring: 'group-hover:ring-emerald-500/20',
      };
    case 'purple-500':
      return {
        badge: 'bg-purple-50 text-purple-700',
        title: 'text-purple-700',
        ring: 'group-hover:ring-purple-500/20',
      };
    default:
      return {
        badge: 'bg-slate-50 text-slate-700',
        title: 'text-slate-900',
        ring: 'group-hover:ring-slate-400/20',
      };
  }
}
