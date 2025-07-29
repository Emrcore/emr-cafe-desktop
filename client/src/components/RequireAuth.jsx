import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function RequireAuth({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="p-4 text-center">Yükleniyor...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
