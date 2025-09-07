import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
  sendPasswordResetEmail,
  sendEmailVerification,
  getIdTokenResult,
  reload,
  GoogleAuthProvider,
  signInWithPopup,
  multiFactor,
  TotpMultiFactorGenerator
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export type UserRole = 'admin' | 'manager' | 'supervisor' | 'worker' | 'client';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  role: UserRole;
  company?: string;
  department?: string;
  permissions: string[];
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  avatar?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, displayName?: string, role?: UserRole) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  resendEmailVerification: () => Promise<void>;
  refreshClaims: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  mfaGenerateTotpSecret: () => Promise<{ uri: string; secretKey: string }>;
  mfaEnrollTotp: (code: string, displayName?: string) => Promise<void>;
  mfaGetEnrolledFactors: () => Array<{ uid: string; displayName?: string; factorId: string }>;
  mfaUnenroll: (uid: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Permissions par rôle
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['*'], // Toutes les permissions
  manager: ['projects.create', 'projects.edit', 'projects.delete', 'quotes.create', 'quotes.edit', 'quotes.send', 'team.view', 'finances.view', 'reports.view'],
  supervisor: ['projects.view', 'projects.edit', 'quotes.create', 'quotes.edit', 'team.view', 'tasks.create', 'tasks.edit'],
  worker: ['projects.view', 'tasks.view', 'tasks.edit', 'documents.view'],
  client: ['quotes.view', 'projects.view']
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingTotpSecret, setPendingTotpSecret] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        // Charger les custom claims pour déterminer le rôle s'il est défini côté serveur
        let roleFromClaims: UserRole | null = null;
        try {
          const tokenResult = await getIdTokenResult(firebaseUser, true);
          const claimRole = (tokenResult.claims as any)?.role as UserRole | undefined;
          if (claimRole) roleFromClaims = claimRole;
        } catch (e) {
          console.warn('Impossible de charger les custom claims:', e);
        }
        const defaultRole = ((import.meta as any)?.env?.VITE_DEFAULT_USER_ROLE || 'worker') as UserRole;

        // Récupérer le profil utilisateur depuis Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile;
            
            // Mettre à jour la dernière connexion
            await updateDoc(doc(db, 'users', firebaseUser.uid), {
              lastLogin: new Date().toISOString()
            });
            
            setUser({
              ...userData,
              role: roleFromClaims || userData.role,
              lastLogin: new Date().toISOString()
            });
          } else {
            // Créer un profil par défaut si inexistant
            const defaultProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              role: roleFromClaims || defaultRole,
              permissions: ROLE_PERMISSIONS[roleFromClaims || defaultRole],
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              isActive: true
            };
            
            await setDoc(doc(db, 'users', firebaseUser.uid), defaultProfile);
            setUser(defaultProfile);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du profil:', error);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, displayName?: string, role: UserRole = 'worker'): Promise<void> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Mettre à jour le profil Firebase
      if (displayName) {
        await updateProfile(firebaseUser, { displayName });
      }

      // Créer le profil utilisateur dans Firestore
      const userProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: displayName || '',
        role,
        permissions: ROLE_PERMISSIONS[role],
        createdAt: new Date().toISOString(),
        isActive: true
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);

      // Envoyer l'email de vérification
      await sendEmailVerification(firebaseUser);
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    }
  };

  const resendEmailVerification = async (): Promise<void> => {
    if (!auth.currentUser) throw new Error('Utilisateur non connecté');
    try {
      await sendEmailVerification(auth.currentUser);
    } catch (e) {
      console.error('Erreur lors de l\'envoi de l\'email de vérification:', e);
      throw e;
    }
  };

  const refreshClaims = async (): Promise<void> => {
    if (!auth.currentUser) return;
    try {
      await reload(auth.currentUser);
      await auth.currentUser.getIdToken(true);
    } catch (e) {
      console.warn('Impossible de rafraîchir les claims:', e);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Erreur de réinitialisation:', error);
      throw error;
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Erreur login Google:', error);
      throw error as Error;
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!user) throw new Error('Utilisateur non connecté');

    try {
      await updateDoc(doc(db, 'users', user.uid), updates);
      setUser({ ...user, ...updates });
    } catch (error) {
      console.error('Erreur de mise à jour du profil:', error);
      throw error;
    }
  };

  // MFA: Générer un secret TOTP et retourner l'URI otpauth et la clé base32
  const mfaGenerateTotpSecret = async (): Promise<{ uri: string; secretKey: string }> => {
    if (!auth.currentUser) throw new Error('Utilisateur non connecté');
    const session = await multiFactor(auth.currentUser).getSession();
    const secret: any = await TotpMultiFactorGenerator.generateSecret(session);
    setPendingTotpSecret(secret);
    const issuer = 'BTP Manager';
    const accountName = auth.currentUser.email || auth.currentUser.uid;
    const uri = secret.generateQrCodeUrl(accountName, issuer);
    const secretKey = secret.secretKey as string; // base32
    return { uri, secretKey };
  };

  // MFA: Enrôler TOTP avec le code de l'application d'authentification
  const mfaEnrollTotp = async (code: string, displayName?: string): Promise<void> => {
    if (!auth.currentUser) throw new Error('Utilisateur non connecté');
    if (!pendingTotpSecret) throw new Error('Secret TOTP manquant. Générez d\'abord un secret.');
    const assertion = TotpMultiFactorGenerator.assertionForEnrollment(pendingTotpSecret, code);
    await multiFactor(auth.currentUser).enroll(assertion, displayName || 'TOTP');
    setPendingTotpSecret(null);
    await auth.currentUser.getIdToken(true);
  };

  // MFA: Récupérer la liste des facteurs enrôlés
  const mfaGetEnrolledFactors = (): Array<{ uid: string; displayName?: string; factorId: string }> => {
    if (!firebaseUser) return [];
    const factors: any[] = multiFactor(firebaseUser).enrolledFactors || [];
    return factors.map((f: any) => ({ uid: f.uid as string, displayName: f.displayName as string | undefined, factorId: f.factorId as string }));
  };

  // MFA: Désenrôler un facteur par UID
  const mfaUnenroll = async (uid: string): Promise<void> => {
    if (!auth.currentUser) throw new Error('Utilisateur non connecté');
    await multiFactor(auth.currentUser).unenroll(uid);
    await auth.currentUser.getIdToken(true);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.permissions.includes('*')) return true;
    return user.permissions.includes(permission);
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    isLoading,
    login,
    logout,
    register,
    resetPassword,
    updateUserProfile,
    hasPermission,
    hasRole,
    resendEmailVerification,
    refreshClaims,
    loginWithGoogle,
    mfaGenerateTotpSecret,
    mfaEnrollTotp,
    mfaGetEnrolledFactors,
    mfaUnenroll,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
