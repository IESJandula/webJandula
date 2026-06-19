// Paleta de colores por categoría de noticia, coherente con la identidad azul del centro.
const PALETTE: Record<string, { badge: string; dot: string }> = {
    Centro: { badge: 'bg-blue-50 text-blue-700 ring-blue-100', dot: 'bg-blue-500' },
    Proyectos: { badge: 'bg-violet-50 text-violet-700 ring-violet-100', dot: 'bg-violet-500' },
    Deportes: { badge: 'bg-emerald-50 text-emerald-700 ring-emerald-100', dot: 'bg-emerald-500' },
    Cultura: { badge: 'bg-amber-50 text-amber-700 ring-amber-100', dot: 'bg-amber-500' },
    Formación: { badge: 'bg-cyan-50 text-cyan-700 ring-cyan-100', dot: 'bg-cyan-500' },
    Otras: { badge: 'bg-slate-100 text-slate-600 ring-slate-200', dot: 'bg-slate-400' },
};

const FALLBACK = { badge: 'bg-blue-50 text-blue-700 ring-blue-100', dot: 'bg-blue-500' };

export function getCategoriaStyle(categoria: string | undefined | null) {
    if (!categoria) return FALLBACK;
    return PALETTE[categoria] ?? FALLBACK;
}
