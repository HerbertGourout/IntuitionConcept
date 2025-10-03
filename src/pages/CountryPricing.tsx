import React, { useEffect, useMemo, useState } from 'react';
import GlobalLayout from '../components/Layout/GlobalLayout';
import { getAvailableCountries, loadDatabase, searchOuvrages, type CountryCode } from '../services/countryPricingService';
import type { PricingDatabase, OuvrageItem, CategoryOuvrages } from '../types/pricing';

const CountryPricing: React.FC = () => {
    const countries = useMemo(() => getAvailableCountries(), []);
    const [country, setCountry] = useState<CountryCode>('CG'); // Default: République du Congo
    const [db, setDb] = useState<PricingDatabase | null>(null);
    const [category, setCategory] = useState<keyof PricingDatabase['categories'] | null>(null);
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [total, setTotal] = useState(0);
    const [items, setItems] = useState<Array<OuvrageItem & { categoryId: string; categoryName: string }>>([]);
    const [loading, setLoading] = useState(false);

    type SortKey = 'categoryName' | 'code' | 'designation' | 'unite' | 'prixUnitaire' | 'source' | 'dateValidite';
    const [sortKey, setSortKey] = useState<SortKey>('code');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    // Price formatter based on current DB currency
    const priceFormatter = useMemo(() => {
        const currency = db?.currency || 'XAF';
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0 });
    }, [db?.currency]);

    // Debounce search input to reduce fetches
    useEffect(() => {
        const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
        return () => clearTimeout(t);
    }, [query]);

    // Load database when country changes
    useEffect(() => {
        const ac = new AbortController();
        setLoading(true);

        (async () => {
            try {
                const database = await loadDatabase(country);
                if (ac.signal.aborted) return;
                setDb(database);
                // Reset category to first available
                const firstCat = Object.keys(database.categories)[0] as keyof PricingDatabase['categories'];
                setCategory(firstCat || null);
                setPage(1);
            } finally {
                if (!ac.signal.aborted) setLoading(false);
            }
        })();

        return () => ac.abort();
    }, [country]);

    // Search (+ sorting)
    useEffect(() => {
        if (category === null) return;
        const ac = new AbortController();
        setLoading(true);

        (async () => {
            try {
                const res = await searchOuvrages(country, { categoryId: category ?? undefined, query: debouncedQuery, page, pageSize });
                if (ac.signal.aborted) return;
                setItems(res.items);
                setTotal(res.total);
            } finally {
                if (!ac.signal.aborted) setLoading(false);
            }
        })();

        return () => ac.abort();
    }, [country, category, debouncedQuery, page, pageSize]);

    // Client-side sorting of the current page (API already paginates)
    const sortedItems = useMemo(() => {
        const arr = [...items];
        arr.sort((a, b) => {
            const dir = sortDir === 'asc' ? 1 : -1;
            const va = (a[sortKey] as unknown) ?? '';
            const vb = (b[sortKey] as unknown) ?? '';
            if (sortKey === 'prixUnitaire') return ((va as number) - (vb as number)) * dir;
            const sa = String(va).toLowerCase();
            const sb = String(vb).toLowerCase();
            if (sa < sb) return -1 * dir;
            if (sa > sb) return 1 * dir;
            return 0;
        });
        return arr;
    }, [items, sortKey, sortDir]);

    const onSort = (key: SortKey) => {
        if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else { setSortKey(key); setSortDir('asc'); }
    };

    // Export current view to CSV
    const exportCsv = () => {
        const header = ['Catégorie', 'Code', 'Désignation', 'Unité', 'Prix unitaire', 'Source', 'Validité'];
        const lines = sortedItems.map(o => [
            o.categoryName,
            o.code,
            o.designation.replace(/\n/g, ' '),
            o.unite,
            String(o.prixUnitaire),
            o.source || (db?.metadata.source ?? ''),
            o.dateValidite ? new Date(o.dateValidite).toISOString().slice(0,10) : ''
        ]);
        const csv = [header, ...lines].map(r => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `base-ouvrages-${country}-${category ?? 'all'}.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    const currentCountry = countries.find(c => c.code === country);

    return (
        <GlobalLayout
            showHero={true}
            heroTitle="Base d'ouvrages (BETA)"
            heroSubtitle={`Marché: ${currentCountry?.name} — ${currentCountry?.currencySymbol}`}
            heroBackground="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900"
        >
            <div className="mx-auto px-4 md:px-10 lg:px-14 max-w-[1600px]">
                {/* Controls */}
                <div className="sticky top-24 z-10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 rounded-xl p-3 md:p-4 border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 shadow-sm">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                        <select
                            value={country}
                            onChange={(e) => { setCountry(e.target.value as CountryCode); setPage(1); }}
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            {countries.map(c => (
                                <option key={c.code} value={c.code}>{c.name} ({c.currencySymbol})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                        <select
                            value={category ?? ''}
                            onChange={(e) => { setCategory(e.target.value as keyof PricingDatabase['categories']); setPage(1); }}
                            className="w-full border rounded-lg px-3 py-2"
                            disabled={!db}
                        >
                            {db && Object.entries(db.categories).map(([cid, cat]) => (
                                <option key={cid} value={cid}>{(cat as CategoryOuvrages).name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rechercher (code, désignation)</label>
                        <input
                            value={query}
                            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                            placeholder="Ex: B.01.001 ou béton"
                            className="w-full border rounded-lg px-3 py-2"
                        />
                        <div className="mt-2 flex items-center gap-2">
                            <button onClick={() => exportCsv()} className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-sm border">Exporter CSV</button>
                            <span className="text-xs text-gray-500">{total} éléments • Page {page}</span>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th onClick={() => onSort('categoryName')} className="cursor-pointer select-none text-left px-4 py-3 text-xs font-semibold text-gray-600">Catégorie</th>
                                    <th onClick={() => onSort('code')} className="cursor-pointer select-none text-left px-4 py-3 text-xs font-semibold text-gray-600">Code</th>
                                    <th onClick={() => onSort('designation')} className="cursor-pointer select-none text-left px-4 py-3 text-xs font-semibold text-gray-600">Désignation</th>
                                    <th onClick={() => onSort('unite')} className="cursor-pointer select-none text-left px-4 py-3 text-xs font-semibold text-gray-600">Unité</th>
                                    <th onClick={() => onSort('prixUnitaire')} className="cursor-pointer select-none text-left px-4 py-3 text-xs font-semibold text-gray-600">Prix unitaire</th>
                                    <th onClick={() => onSort('source')} className="cursor-pointer select-none text-left px-4 py-3 text-xs font-semibold text-gray-600">Source</th>
                                    <th onClick={() => onSort('dateValidite')} className="cursor-pointer select-none text-left px-4 py-3 text-xs font-semibold text-gray-600">Validité</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td className="px-4 py-6" colSpan={7}>Chargement...</td></tr>
                                ) : sortedItems.length === 0 ? (
                                    <tr><td className="px-4 py-10 text-center text-gray-500" colSpan={7}>Aucun résultat. Essayez un autre mot-clé ou une autre catégorie.</td></tr>
                                ) : (
                                    sortedItems.map((o, idx) => (
                                        <tr key={`${o.code}-${idx}`} className="border-t">
                                            <td className="px-4 py-3 text-sm text-gray-700">{o.categoryName}</td>
                                            <td className="px-4 py-3 text-sm font-mono text-gray-900">{o.code}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{o.designation}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{o.unite}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{priceFormatter.format(o.prixUnitaire)}</td>
                                            <td className="px-4 py-3 text-xs text-gray-600">{o.source || db?.metadata.source}</td>
                                            <td className="px-4 py-3 text-xs text-gray-600">{(o.dateValidite ? new Date(o.dateValidite).toLocaleDateString() : '')}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                        <div className="text-sm text-gray-600">{total} éléments</div>
                        <div className="flex items-center gap-2">
                            <button
                                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page <= 1}
                            >
                                Précédent
                            </button>
                            <span className="text-sm">Page {page}</span>
                            <button
                                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                                onClick={() => setPage(p => (items.length < pageSize ? p : p + 1))}
                                disabled={items.length < pageSize}
                            >
                                Suivant
                            </button>
                            <select
                                value={pageSize}
                                onChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(1); }}
                                className="ml-2 border rounded px-2 py-1 text-sm"
                            >
                                {[10, 20, 50].map(s => <option key={s} value={s}>{s}/page</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </GlobalLayout>
    );
};

export default CountryPricing;
