import { useState, useEffect } from 'react';
import axios from 'axios';

export function useAuth() {
  const [authState, setAuthState] = useState('loading'); // loading | authenticated | unauthenticated

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setAuthState('unauthenticated');
      return;
    }

    axios.get('/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(({ data }) => {
        if (data.valid) setAuthState('authenticated');
        else {
          localStorage.removeItem('auth_token');
          setAuthState('unauthenticated');
        }
      })
      .catch(() => {
        localStorage.removeItem('auth_token');
        setAuthState('unauthenticated');
      });
  }, []);

  function onAuthenticated() {
    setAuthState('authenticated');
  }

  function logout() {
    localStorage.removeItem('auth_token');
    setAuthState('unauthenticated');
  }

  return { authState, onAuthenticated, logout };
}
