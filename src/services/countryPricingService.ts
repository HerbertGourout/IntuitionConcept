import type { PricingDatabase, OuvrageItem, CategoryOuvrages } from '../types/pricing';

export type CountryCode = 'CG' | 'CD' | 'CM';

export interface CountryInfo {
    code: CountryCode;
    name: string;
    currency: string;
    currencySymbol: string;
    regionLabel: string;
    defaultCity?: string;
}

const AVAILABLE_COUNTRIES: CountryInfo[] = [
    { code: 'CG', name: 'République du Congo', currency: 'XAF', currencySymbol: 'FCFA', regionLabel: 'Afrique Centrale (BEAC)', defaultCity: 'Brazzaville' },
    { code: 'CD', name: 'République Démocratique du Congo', currency: 'CDF', currencySymbol: 'FC', regionLabel: 'Afrique Centrale', defaultCity: 'Kinshasa' },
    { code: 'CM', name: 'Cameroun', currency: 'XAF', currencySymbol: 'FCFA', regionLabel: 'Afrique Centrale (BEAC)', defaultCity: 'Douala / Yaoundé' },
];

export const getAvailableCountries = (): CountryInfo[] => AVAILABLE_COUNTRIES;

export const loadDatabase = async (countryCode: CountryCode): Promise<PricingDatabase> => {
    switch (countryCode) {
        case 'CG':
            return (await import('../data/pricing/cg.json')).default as unknown as PricingDatabase;
        case 'CD':
            return (await import('../data/pricing/cd.json')).default as unknown as PricingDatabase;
        case 'CM':
            return (await import('../data/pricing/cm.json')).default as unknown as PricingDatabase;
        default:
            throw new Error(`Unsupported country code: ${countryCode}`);
    }
};

export interface SearchOptions {
    categoryId?: keyof PricingDatabase['categories'];
    query?: string; // matches code/designation
    page?: number;
    pageSize?: number;
}

export interface SearchResult {
    total: number;
    items: Array<OuvrageItem & { categoryId: string; categoryName: string }>;
}

export const searchOuvrages = async (
    country: CountryCode,
    options: SearchOptions = {}
): Promise<SearchResult> => {
    const db = await loadDatabase(country);
    const { categoryId, query = '', page = 1, pageSize = 20 } = options;
    const q = query.trim().toLowerCase();

    type Categories = PricingDatabase['categories'];
    type CategoryKey = keyof Categories;
    const categoriesEntries = Object.entries(db.categories) as Array<[
        CategoryKey,
        CategoryOuvrages
    ]>;

    const pool = categoriesEntries
        .filter(([cid]) => (categoryId ? cid === categoryId : true))
        .flatMap(([cid, cat]) =>
            cat.ouvrages.map((o: OuvrageItem) => ({
                ...o,
                categoryId: cid as string,
                categoryName: cat.name,
            }))
        )
        .filter((o) =>
            q
                ? o.code.toLowerCase().includes(q) || o.designation.toLowerCase().includes(q)
                : true
        );

    const total = pool.length;
    const start = (page - 1) * pageSize;
    const items = pool.slice(start, start + pageSize);

    return { total, items };
};
