import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase/firebase.config";
import { api, setToken } from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // merged firebase + db user
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true); // firebase auth restoring

  /** After any firebase sign-in: exchange ID token for our JWT + upsert profile. */
  const syncWithServer = useCallback(async (fbUser, extra = {}) => {
    const idToken = await fbUser.getIdToken(true);
    const res = await api.post(
      "/api/users",
      {
        name: extra.name || fbUser.displayName || "",
        photoURL: extra.photoURL || fbUser.photoURL || "",
        role: extra.role ?? pendingRoleRef.current, // only honored for brand-new accounts
      },
      { headers: { Authorization: `Bearer ${idToken}` } }
    );
    pendingRoleRef.current = null;
    setToken(res.data.token ?? null);
    if (res.data.user) setDbUser(res.data.user);
    return res.data;
  }, []);

  /** Fetch fresh profile from our DB (role may change after admin approval). */
  const refreshDbUser = useCallback(async () => {
    try {
      const res = await api.get("/api/users/me");
      if (res.data.user) {
        setDbUser(res.data.user);
        return res.data.user;
      }
    } catch {
      /* token refresh issues surface elsewhere */
    }
    return null;
  }, []);

  // The role a brand-new account wants (set synchronously by register() BEFORE
  // createUser, so the onAuthStateChanged sync can never miss it — a
  // window-event based approach used to lose that race).
  const pendingRoleRef = useRef(null);
  const syncPromiseRef = useRef(null);

  // Exchange a fresh ID token for our JWT whenever firebase session restores.
  // A single shared promise dedupes concurrent syncs (StrictMode + register).
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        try {
          syncPromiseRef.current = syncPromiseRef.current || syncWithServer(fbUser);
          await syncPromiseRef.current;
        } catch (err) {
          console.error("Session sync failed:", err);
        } finally {
          syncPromiseRef.current = null;
        }
      } else {
        setToken(null);
        setDbUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [syncWithServer]);

  const register = useCallback(
    async ({ name, email, password, photoURL, role }) => {
      // Set the role hint synchronously BEFORE createUser — onAuthStateChanged
      // fires the server sync and reads it from the ref. No event race.
      pendingRoleRef.current = role || null;
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (photoURL || name) {
        await updateProfile(cred.user, { displayName: name, photoURL: photoURL || undefined });
      }
      return cred.user;
    },
    []
  );

  const login = useCallback((email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  }, []);

  const googleLogin = useCallback(() => {
    return signInWithPopup(auth, googleProvider);
  }, []);

  const resetPassword = useCallback((email) => sendPasswordResetEmail(auth, email), []);

  const logout = useCallback(async () => {
    setToken(null);
    setDbUser(null);
    await signOut(auth);
  }, []);

  const value = {
    user, // firebase user (uid, email, photoURL...)
    dbUser, // our DB profile (role, guideApplication status)
    role: dbUser?.role || "traveler",
    loading,
    register,
    login,
    googleLogin,
    logout,
    resetPassword,
    syncWithServer,
    refreshDbUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
