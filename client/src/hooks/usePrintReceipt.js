// hooks/usePrintReceipt.js
export function usePrintReceipt() {
  const print = async (receiptData) => {
    if (window.electron?.ipcRenderer) {
      await window.electron.ipcRenderer.invoke("print-receipt", receiptData);
    } else {
      alert("Yazd�rma �zelli�i masa�st� modda �al���r.");
    }
  };

  return { print };
}
