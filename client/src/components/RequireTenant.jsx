// client/src/components/RequireTenant.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RequireTenant({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const tenantUrl = localStorage.getItem("tenant_url");
    if (!tenantUrl) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return children;
}
