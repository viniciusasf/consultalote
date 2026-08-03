import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setAuthToken, setOnUnauthorized } from '../api/client';
import { fetchMe } from '../api/authClient';

const AuthContext = createContext(null);

const TOKEN_KEY = 'consultalote_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [role, setRole] = useState(null);
  const [localId, setLocalId] = useState(null);
  const [localNome, setLocalNome] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setToken(null);
    setRole(null);
    setLocalId(null);
    setLocalNome(null);
  }, []);

  const login = useCallback((data) => {
    localStorage.setItem(TOKEN_KEY, data.access_token);
    setAuthToken(data.access_token);
    setToken(data.access_token);
    setRole(data.role);
    setLocalId(data.local_id || null);
    setLocalNome(data.local_nome || null);
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => logout());
  }, [logout]);

  // Ao montar: se há token salvo, valida contra o backend (fonte da verdade,
  // não confiamos em decodificar o JWT no cliente) e reidrata a sessão.
  useEffect(() => {
    let cancelado = false;
    async function hydrate() {
      if (!token) {
        setLoading(false);
        return;
      }
      setAuthToken(token);
      try {
        const me = await fetchMe();
        if (cancelado) return;
        setRole(me.role);
        setLocalId(me.local_id || null);
        setLocalNome(me.local_nome || null);
      } catch {
        if (!cancelado) logout();
      } finally {
        if (!cancelado) setLoading(false);
      }
    }
    hydrate();
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    token,
    role,
    localId,
    localNome,
    isAuthenticated: !!token && !!role,
    isMaster: role === 'master',
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
