import { createContext, useState, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('name');
    const id = localStorage.getItem('userId');
    const tokenAdmin = localStorage.getItem('tokenAdmin');
    if (!token) return null;
    return {
      id,
      name,
      email: localStorage.getItem('email') || '',
      phone: localStorage.getItem('phone') || '',
      address: localStorage.getItem('address') || '',
      token,
      isAdmin: tokenAdmin === token,
    };
  });

  // تسجيل الدخول — يحفظ البيانات في الـ state و localStorage
  const login = useCallback((data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('name', data.name || '');
    if (data.id) localStorage.setItem('userId', data.id);
    localStorage.setItem('email', data.email || '');
    localStorage.setItem('phone', data.phone || '');
    localStorage.setItem('address', data.address || '');
    localStorage.removeItem('tokenAdmin');
    if (data.isAdmin) {
      localStorage.setItem('tokenAdmin', data.token);
    }
    setUser({
      id: data.id,
      name: data.name,
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      token: data.token,
      isAdmin: !!data.isAdmin,
    });
  }, []);

  const logout = useCallback(() => {
    ['token', 'tokenAdmin', 'name', 'userId', 'email', 'phone', 'address']
      .forEach((key) => localStorage.removeItem(key));
    setUser(null);
  }, []);

  const isLoggedIn = !!user?.token;
  const isAdmin = !!user?.isAdmin;
  const userName = user?.name || 'Guest';

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn,
      isAdmin,
      userName,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
