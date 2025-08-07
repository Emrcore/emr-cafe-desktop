// src/components/ToasterProvider.jsx
import { Toaster } from "react-hot-toast";

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        duration: 4000,
        style: {
          background: "#1e293b", // slate-800
          color: "#f1f5f9", // slate-100
          border: "1px solid #334155", // slate-700
          padding: "10px 16px",
          fontSize: "14px",
        },
        success: {
          iconTheme: {
            primary: "#22c55e", // green-500
            secondary: "#ecfdf5", // green-50
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444", // red-500
            secondary: "#fee2e2", // red-100
          },
        },
      }}
    />
  );
}
