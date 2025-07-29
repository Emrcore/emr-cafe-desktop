import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    let config = { cloudApi: "", lisansKey: "", cihazId: "" };

    if (window.emrConfig?.get) {
      config = window.emrConfig.get();
    } else {
      console.warn("window.emrConfig tanımsız. Lisans kontrolü atlanıyor.");
      config = {
        cloudApi: "http://localhost:4000/api/check",
        lisansKey: "ABC123",
        cihazId: "A1B2-C3D4"
      };
    }

    const licenseCheck = await axios.post(config.cloudApi, {
      lisansKey: config.lisansKey,
      cihazId: config.cihazId,
    }).catch(() => {
      setError("Lisans doğrulaması başarısız.");
      return null;
    });

    if (!licenseCheck?.data?.valid) {
      setError("Lisans geçersiz veya süresi dolmuş.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3001/api/login", form);
      login(res.data);
      navigate("/");
    } catch (err) {
      setError("Kullanıcı adı veya şifre hatalı");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-80">
        <h2 className="text-lg font-bold mb-4 text-center">EMR CAFE GİRİŞ</h2>
        {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}
        <input
          type="text"
          name="username"
          placeholder="Kullanıcı adı"
          className="w-full mb-2 p-2 border"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Şifre"
          className="w-full mb-4 p-2 border"
          onChange={handleChange}
          required
        />
        <button className="bg-blue-600 w-full text-white py-2 rounded">Giriş</button>
      </form>
    </div>
  );
}
