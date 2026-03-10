"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";

import { getFirebaseAuth } from "@/lib/firebase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const firebaseAuth = getFirebaseAuth();
    if (!firebaseAuth) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const firebaseAuth = getFirebaseAuth();
    if (!firebaseAuth) {
      throw new Error("Firebase client config is missing.");
    }
    await signInWithEmailAndPassword(firebaseAuth, email, password);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const firebaseAuth = getFirebaseAuth();
    if (!firebaseAuth) {
      throw new Error("Firebase client config is missing.");
    }
    await createUserWithEmailAndPassword(firebaseAuth, email, password);
  }, []);

  const signOut = useCallback(async () => {
    const firebaseAuth = getFirebaseAuth();
    if (!firebaseAuth) {
      return;
    }
    await firebaseSignOut(firebaseAuth);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      signOut,
    }),
    [loading, signIn, signOut, signUp, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return context;
}
