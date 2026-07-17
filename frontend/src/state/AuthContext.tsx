import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {setAuthToken} from '../services/api';
import {
  requestOtp as apiRequestOtp,
  verifyOtp as apiVerifyOtp,
  updateProfile as apiUpdateProfile,
  getProfile as apiGetProfile,
  type ApiUser,
  type ProfilePatch,
} from '../services/authService';
import {hydrateMenu} from '../services/menuService';
import {hydrateBranches} from '../services/reservationService';
import {hydrateExperiences} from '../services/loyaltyService';

const TOKEN_KEY = '@dishdash/token';
const USER_KEY = '@dishdash/user';

type AuthValue = {
  ready: boolean;
  token: string | null;
  user: ApiUser | null;
  isAuthed: boolean;
  requestOtp: (phone: string) => Promise<{devCode?: string}>;
  verifyOtp: (
    phone: string,
    code: string,
  ) => Promise<{isNewUser: boolean; user: ApiUser}>;
  updateProfile: (patch: ProfilePatch) => Promise<ApiUser>;
  /** Re-fetch the signed-in user's profile from the backend. */
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<ApiUser | null>(null);

  // Restore a persisted session + hydrate the menu catalog on startup.
  useEffect(() => {
    (async () => {
      try {
        const [savedToken, savedUser] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);
        if (savedToken) {
          setAuthToken(savedToken);
          setToken(savedToken);
        }
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
        // With a restored session, pull the latest profile so the Home
        // greeting / details reflect the server (name, email, points, etc.).
        if (savedToken) {
          apiGetProfile()
            .then(fresh => {
              setUser(fresh);
              AsyncStorage.setItem(USER_KEY, JSON.stringify(fresh));
            })
            .catch(() => {});
        }
      } catch {
        // ignore — start unauthenticated
      } finally {
        setReady(true);
      }
      // Public catalog; runs regardless of auth. Silently falls back to mock.
      hydrateMenu();
      hydrateBranches();
      hydrateExperiences();
    })();
  }, []);

  const requestOtp = useCallback((phone: string) => apiRequestOtp(phone), []);

  const verifyOtp = useCallback(async (phone: string, code: string) => {
    const result = await apiVerifyOtp(phone, code);
    setAuthToken(result.token);
    setToken(result.token);
    setUser(result.user);
    await AsyncStorage.setItem(TOKEN_KEY, result.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(result.user));
    return {isNewUser: result.isNewUser, user: result.user};
  }, []);

  const updateProfile = useCallback(
    async (patch: ProfilePatch) => {
      const updated = await apiUpdateProfile(patch);
      setUser(updated);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    },
    [],
  );

  const refreshProfile = useCallback(async () => {
    try {
      const fresh = await apiGetProfile();
      setUser(fresh);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(fresh));
    } catch {
      // keep the cached user on failure
    }
  }, []);

  const signOut = useCallback(async () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      ready,
      token,
      user,
      isAuthed: !!token,
      requestOtp,
      verifyOtp,
      updateProfile,
      refreshProfile,
      signOut,
    }),
    [
      ready,
      token,
      user,
      requestOtp,
      verifyOtp,
      updateProfile,
      refreshProfile,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
