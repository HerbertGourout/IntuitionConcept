import { db, storage } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface CompanyBranding {
  companyName: string;
  companyAddress: string;
  footerContact: string;
  logoUrl?: string;
  updatedAt: string;
}

const COLLECTION = 'companyProfiles';

export const BrandingService = {
  async getProfile(ownerId: string): Promise<CompanyBranding | null> {
    const dref = doc(db, COLLECTION, ownerId);
    const snap = await getDoc(dref);
    if (!snap.exists()) return null;
    return snap.data() as CompanyBranding;
  },

  async saveProfile(ownerId: string, data: Partial<CompanyBranding>): Promise<void> {
    const now = new Date().toISOString();
    const dref = doc(db, COLLECTION, ownerId);
    const current = (await getDoc(dref)).data() as CompanyBranding | undefined;
    const merged: CompanyBranding = {
      companyName: data.companyName ?? current?.companyName ?? '',
      companyAddress: data.companyAddress ?? current?.companyAddress ?? '',
      footerContact: data.footerContact ?? current?.footerContact ?? '',
      logoUrl: data.logoUrl ?? current?.logoUrl,
      updatedAt: now,
    };
    await setDoc(dref, merged, { merge: true });
  },

  async uploadLogo(ownerId: string, file: File): Promise<string> {
    const path = `branding/${ownerId}/logo_${Date.now()}`;
    const sref = ref(storage, path);
    await uploadBytes(sref, file);
    return getDownloadURL(sref);
  },
};
