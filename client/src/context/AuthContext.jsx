import { createContext, useState, useEffect, useContext } from "react";
import socket from "../socket"; // 📡 socket bağlantısı

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Kullanıcıyı localStorage'dan yükle
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // 📡 Kullanıcı online bildirimi gönder
      socket.emit("userOnline", parsedUser._id);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    socket.emit("userOnline", userData._id);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    socket.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Eksik olan satır — bunu ekle:
export function useAuth() {
  return useContext(AuthContext);
}
