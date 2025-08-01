// src/components/ToasterProvider.jsx
import { Toaster } from "react-hot-toast";

export default function ToasterProvider() {
  return <Toaster position="top-right" reverseOrder={false} />;
}
