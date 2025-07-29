import BackButton from "../components/BackButton";
import { Link } from "react-router-dom";

export default function AdminPanel() {
  return (
 

    <div className="p-4">
      <BackButton />
      <h2 className="text-xl font-bold mb-4">Admin Paneli</h2>
      <ul className="space-y-2">
        <li>
          <Link to="/admin/tables" className="text-blue-600 underline">
            Masa Yönetimi
          </Link>
        </li>
        <li>
          <Link to="/admin/products" className="text-blue-600 underline">
            Ürün Yönetimi
          </Link>
        </li>
        <li>
          <Link to="/settings" className="text-blue-600 underline">
            Ayarlar
          </Link>
        </li>
        <li>
          <Link to="/users" className="text-blue-600 underline">
            Kullanıcılar
          </Link>
        </li>
        <li>
          <Link to="/report" className="text-blue-600 underline">
            Raporlar
          </Link>
        </li>
      </ul>
    </div>
  );
}
