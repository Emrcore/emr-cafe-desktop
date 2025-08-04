export function usePrintKitchen() {
  const print = async (orderData) => {
    if (window.electronAPI?.printKitchen) {
      await window.electronAPI.printKitchen(orderData);
    } else {
      alert("Bu özellik masaüstü uygulamada çalýþýr.");
    }
  };

  return { print };
}
