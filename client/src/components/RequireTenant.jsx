import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RequireTenant({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const tenant = localStorage.getItem("tenant_url");
    if (!tenant) {
      navigate("/tenant", { replace: true });
    }
  }, []);

  return children;
}
