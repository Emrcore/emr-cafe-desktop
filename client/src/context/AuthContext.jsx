import { createContext, useState, useEffect } from "react";
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

  // Login olduğunda:
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));

    // 📡 Socket ile kullanıcı online bildir
    socket.emit("userOnline", userData._id);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");

    // 🔌 Bağlantıyı kes
    socket.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
