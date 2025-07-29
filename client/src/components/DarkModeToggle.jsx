// client/src/components/DarkModeToggle.jsx
import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [enabled, setEnabled] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    if (enabled) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [enabled]);

  return (
    <button
      className="text-sm px-3 py-1 rounded border dark:text-white"
      onClick={() => setEnabled(!enabled)}
    >
      {enabled ? "☀️ Aydınlık" : "🌙 Karanlık"}
    </button>
  );
}
