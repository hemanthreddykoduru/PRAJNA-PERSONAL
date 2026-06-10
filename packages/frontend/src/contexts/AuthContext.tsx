import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getCurrentUser, fetchUserAttributes, fetchAuthSession, signOut } from 'aws-amplify/auth';

export type UserRole = 'Faculty' | 'HoD' | 'Director' | 'ProVC' | 'IQAC' | 'Admin';

export interface AuthUser {
  sub: string;
  email: string;
  role: UserRole;
  campus: string;
  department: string;
  empId: string;
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOutUser: async () => {},
});

export const ROLE_HOME: Record<UserRole, string> = {
  Faculty: '/dashboard/faculty',
  HoD: '/dashboard/hod',
  Director: '/dashboard/director',
  ProVC: '/dashboard/provc',
  IQAC: '/dashboard/iqac',
  Admin: '/dashboard/admin',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider Mounted. Current Loading:', loading);
    loadUser();
  }, []);

  const loadUser = async () => {
    // Safety timeout: If auth takes more than 5 seconds, fail gracefully to login
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Auth Timeout')), 5000)
    );

    try {
      await Promise.race([
        (async () => {
          await getCurrentUser();
          const [attrs, session] = await Promise.all([
            fetchUserAttributes(),
            fetchAuthSession(),
          ]);

          const payload = session.tokens?.idToken?.payload as any;
          const groups: string[] = payload?.['cognito:groups'] || [];
          console.log('Detected Cognito Groups:', groups);

          let role: UserRole = 'Faculty';
          if (groups.includes('Admin')) role = 'Admin';
          else if (groups.includes('ProVC')) role = 'ProVC';
          else if (groups.includes('Director')) role = 'Director';
          else if (groups.includes('IQAC')) role = 'IQAC';
          else if (groups.includes('HoD')) role = 'HoD';

          setUser({
            sub: payload?.sub || '',
            email: attrs.email || '',
            role,
            campus: payload?.['custom:campus'] || 'Bengaluru',
            department: payload?.['custom:department'] || 'CSE',
            empId: payload?.['custom:empId'] || '',
            name: attrs.name || attrs.email?.split('@')[0] || 'User',
          });
        })(),
        timeoutPromise
      ]);
    } catch (err) {
      console.error('Auth Load Error:', err);
      setUser(null);
      // BREAK THE LOOP: If we can't load the user but tokens exist, the session is corrupted/invalid.
      // We must clear it, otherwise LoginPage will see the bad tokens and redirect back here infinitely.
      Object.keys(localStorage).forEach(key => {
        if (key.includes('amplify') || key.includes('CognitoIdentityServiceProvider')) {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    try {
      // 1. Trigger background signout (don't await)
      signOut({ global: false }).catch(() => {});
      
      // 2. Nuclear Local Cleanup
      // Clear all Amplify/Cognito keys from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.includes('amplify') || key.includes('CognitoIdentityServiceProvider')) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear specific session keys
      localStorage.removeItem('prajna_session');
      sessionStorage.clear();
      
      // 3. Clear State
      setUser(null);
    } catch (err) {
      console.error('Signout failed', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
