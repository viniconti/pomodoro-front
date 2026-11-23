"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
} from "react";
import { IAuthTokenPayload, IAuthUser } from "../interfaces/IAuthUser";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import {
  clearStoredToken,
  getStoredToken,
  storeToken,
  TOKEN_STORAGE_KEY,
} from "../services/api";

type AuthContextProps = {
  user: IAuthUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  token: string | null;
  signIn: (token: string, remember?: boolean) => void;
  signOut: () => void;
};

type AuthSession = Omit<AuthContextProps, "signIn" | "signOut">;

const AUTH_CHANGE_EVENT = "pomodoro:auth-change";

const SERVER_SESSION: AuthSession = {
  user: null,
  isLoggedIn: false,
  isLoading: true,
  token: null,
};

let cachedToken: string | null | undefined;
let cachedSession: AuthSession = SERVER_SESSION;

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined,
);

function decodeUserFromToken(token: string): IAuthUser | null {
  try {
    const payload = jwtDecode<IAuthTokenPayload>(token);

    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      return null;
    }

    if (!payload.sub || !payload.email) {
      return null;
    }

    return {
      id: Number(payload.sub),
      email: payload.email,
    };
  } catch {
    return null;
  }
}

function getSessionSnapshot(): AuthSession {
  const token = getStoredToken();

  if (token === cachedToken) {
    return cachedSession;
  }

  cachedToken = token;

  if (!token) {
    cachedSession = {
      user: null,
      isLoggedIn: false,
      isLoading: false,
      token: null,
    };

    return cachedSession;
  }

  const user = decodeUserFromToken(token);

  cachedSession = {
    user,
    isLoggedIn: Boolean(user),
    isLoading: false,
    token,
  };

  return cachedSession;
}

function getServerSnapshot(): AuthSession {
  return SERVER_SESSION;
}

function subscribeToAuthChanges(onStoreChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === TOKEN_STORAGE_KEY) {
      onStoreChange();
    }
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(AUTH_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(AUTH_CHANGE_EVENT, onStoreChange);
  };
}

function notifyAuthChange() {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const session = useSyncExternalStore(
    subscribeToAuthChanges,
    getSessionSnapshot,
    getServerSnapshot,
  );
  const router = useRouter();

  function signIn(accessToken: string, remember = false) {
    const decodedUser = decodeUserFromToken(accessToken);

    if (!decodedUser) {
      throw new Error("Token de autenticação inválido ou expirado.");
    }

    storeToken(accessToken, remember);
    notifyAuthChange();
  }

  function signOut() {
    clearStoredToken();
    notifyAuthChange();
    router.push("/login");
  }

  return (
    <AuthContext.Provider
      value={{ ...session, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider.");
  }

  return context;
}
