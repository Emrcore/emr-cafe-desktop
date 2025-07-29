// src/pages/SubscriptionExpired.jsx

export default function SubscriptionExpired() {
  return (
    <div className="flex items-center justify-center h-screen bg-red-100">
      <div className="bg-white p-6 rounded shadow text-center">
        <h1 className="text-2xl font-bold text-red-600">Aboneliğiniz Sona Erdi</h1>
        <p className="mt-2 text-gray-700">
          Lütfen yöneticinizle iletişime geçin veya destek birimimizle görüşün.
        </p>
      </div>
    </div>
  );
}
