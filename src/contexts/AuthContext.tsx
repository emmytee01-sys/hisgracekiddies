import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

function inferRoleFromEmail(email: string): UserRole {
  const e = email.toLowerCase();
  if (e.startsWith('admin@')) return 'admin';
  if (e.startsWith('secretary@')) return 'secretary';
  if (e.startsWith('teacher@')) return 'teacher';
  if (e.startsWith('parent@')) return 'parent';
  if (e.includes('tosinoke0')) return 'admin'; // Special case for your email
  return 'teacher';
}

function splitNameFromEmail(email: string): { firstName: string; lastName: string } {
  const local = email.split('@')[0];
  const parts = local.split('.');
  if (parts.length >= 2) {
    return { firstName: capitalize(parts[0]), lastName: capitalize(parts[1]) };
  }
  return { firstName: capitalize(local), lastName: '' };
}

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const ensureUserProfile = async (user: FirebaseUser) => {
    const ref = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);
    
    // Force recreate profile for tosinoke0@gmail.com to ensure admin role
    if (user.email === 'tosinoke0@gmail.com') {
      const inferredRole = inferRoleFromEmail(user.email || '');
      const name = user.displayName ? user.displayName.split(' ') : [];
      const { firstName, lastName } = name.length >= 2
        ? { firstName: name[0], lastName: name.slice(1).join(' ') }
        : splitNameFromEmail(user.email || 'user');
      const profile: Omit<User, 'id'> = {
        email: user.email || '',
        role: inferredRole,
        firstName,
        lastName,
        phoneNumber: '',
        profileImage: user.photoURL || null,
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date(),
      } as any;
      await setDoc(ref, profile);
      return { id: user.uid, ...profile } as User;
    }
    
    if (!snap.exists()) {
      const inferredRole = inferRoleFromEmail(user.email || '');
      const name = user.displayName ? user.displayName.split(' ') : [];
      const { firstName, lastName } = name.length >= 2
        ? { firstName: name[0], lastName: name.slice(1).join(' ') }
        : splitNameFromEmail(user.email || 'user');
      const profile: Omit<User, 'id'> = {
        email: user.email || '',
        role: inferredRole,
        firstName,
        lastName,
        phoneNumber: '',
        profileImage: user.photoURL || null,
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date(),
      } as any;
      await setDoc(ref, profile);
      return { id: user.uid, ...profile } as User;
    } else {
      const data = snap.data() as User;
      return { ...data, id: user.uid } as User;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const profile = await ensureUserProfile(user);
      setUserProfile(profile);
      setCurrentUser(user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!userProfile) return false;
    return roles.includes(userProfile.role);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const profile = await ensureUserProfile(user);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error ensuring user profile:', error);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    login,
    logout,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 