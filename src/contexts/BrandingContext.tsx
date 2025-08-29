import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { BrandingService, CompanyBranding } from '../services/brandingService';
import { useAuth } from './AuthContext';

export interface BrandingContextValue {
  loading: boolean;
  profile: CompanyBranding | null;
  logoDataUrl?: string | null;
  refresh: () => Promise<void>;
  save: (data: Partial<CompanyBranding>) => Promise<void>;
  uploadLogo: (file: File) => Promise<void>;
}

const BrandingContext = createContext<BrandingContextValue | undefined>(undefined);

async function urlToDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<CompanyBranding | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

  const ownerId = user?.uid || null;

  const load = async () => {
    if (!ownerId) {
      setProfile(null);
      setLogoDataUrl(null);
      return;
    }
    setLoading(true);
    try {
      const p = await BrandingService.getProfile(ownerId);
      setProfile(p);
      if (p?.logoUrl) {
        try {
          const dataUrl = await urlToDataUrl(p.logoUrl);
          setLogoDataUrl(dataUrl);
        } catch {
          setLogoDataUrl(null);
        }
      } else {
        setLogoDataUrl(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId]);

  const value = useMemo<BrandingContextValue>(() => ({
    loading,
    profile,
    logoDataUrl,
    refresh: load,
    save: async (data) => {
      if (!ownerId) return;
      await BrandingService.saveProfile(ownerId, data);
      await load();
    },
    uploadLogo: async (file: File) => {
      if (!ownerId) return;
      const url = await BrandingService.uploadLogo(ownerId, file);
      await BrandingService.saveProfile(ownerId, { logoUrl: url });
      await load();
    }
  }), [loading, profile, logoDataUrl, ownerId]);

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error('useBranding must be used within BrandingProvider');
  return ctx;
};
