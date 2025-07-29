// src/components/BackButton.jsx
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ className = "mb-4" }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`flex items-center text-sm px-3 py-1 w-fit border border-transparent rounded text-blue-600 dark:text-blue-300 hover:underline transition ${className}`}
    >
      <ArrowLeft size={16} className="mr-2" />
      Geri
    </button>
  );
}
