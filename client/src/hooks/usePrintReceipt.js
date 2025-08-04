// hooks/usePrintReceipt.js
export function usePrintReceipt() {
  const print = async (receiptData) => {
    if (window.electron?.ipcRenderer) {
      await window.electron.ipcRenderer.invoke("print-receipt", receiptData);
    } else {
      alert("Yazdýrma özelliði masaüstü modda çalýþýr.");
    }
  };

  return { print };
}
