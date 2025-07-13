import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, getIdTokenResult, User as FirebaseUser } from "firebase/auth";

export function useUserRole() {
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        const token = await getIdTokenResult(user, true);
        setRole(typeof token.claims.role === 'string' ? token.claims.role : null);
      } else {
        setRole(null);
      }
    });
    return () => unsubscribe();
  }, []);
  return role;
}
