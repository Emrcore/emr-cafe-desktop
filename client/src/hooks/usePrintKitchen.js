export function usePrintKitchen() {
  const print = async (orderData) => {
    if (window.electronAPI?.printKitchen) {
      await window.electronAPI.printKitchen(orderData);
    } else {
      alert("Bu �zellik masa�st� uygulamada �al���r.");
    }
  };

  return { print };
}
