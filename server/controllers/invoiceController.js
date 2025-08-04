const Invoice = require("../models/Invoice");

async function createInvoice(data) {
  const last = await Invoice.findOne().sort({ createdAt: -1 });
  const nextNumber = last ? parseInt(last.invoiceNumber.split("-")[1]) + 1 : 1;
  const invoiceNumber = `FTR-${String(nextNumber).padStart(6, "0")}`;

  const newInvoice = new Invoice({
    ...data,
    invoiceNumber
  });

  await newInvoice.save();
  return newInvoice;
}
