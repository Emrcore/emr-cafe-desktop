import { createContext, useState, useEffect, useContext } from "react";
import  socket  from "../socket"; // ✅ named import

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Her zaman login ekranından başlasın
  useEffect(() => {
    setUser(null); // Temiz başlat
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    socket.connect(); // socket bağlantısını yeniden başlat
    socket.emit("userOnline", userData._id);
  };

  const logout = () => {
    if (user?._id) {
      socket.emit("userOffline", user._id);
    }
    setUser(null);
    socket.disconnect();
  };

  // Rol kontrolü
  const hasRole = (role) => user?.role === role;

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
