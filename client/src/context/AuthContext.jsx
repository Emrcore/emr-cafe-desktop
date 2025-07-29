import { createContext, useState, useEffect, useContext } from "react";
import socket from "../socket"; // 📡 socket bağlantısı

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Otomatik giriş devre dışı bırakıldı
  useEffect(() => {
    setLoading(false); // Her zaman login ekranından başlasın
  }, []);

  const login = (userData) => {
    setUser(userData);
    // ❌ localStorage kaldırıldı
    socket.emit("userOnline", userData._id);
  };

  const logout = () => {
    setUser(null);
    socket.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Dışarıdan kullanıcı bilgisine erişmek için
export function useAuth() {
  return useContext(AuthContext);
}
