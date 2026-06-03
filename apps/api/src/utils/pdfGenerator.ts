import PDFDocument from "pdfkit";

export function billPdfBuffer(bill: {
  id: string;
  subtotal: number;
  gstAmount: number;
  serviceCharge: number;
  discount: number;
  totalAmount: number;
}) {
  const doc = new PDFDocument({ margin: 48 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));

  doc.fontSize(20).text("UXITECH Restaurant Software", { align: "center" });
  doc.moveDown().fontSize(12).text(`Bill ID: ${bill.id}`);
  doc.text(`Subtotal: Rs. ${bill.subtotal.toFixed(2)}`);
  doc.text(`GST: Rs. ${bill.gstAmount.toFixed(2)}`);
  doc.text(`Service Charge: Rs. ${bill.serviceCharge.toFixed(2)}`);
  doc.text(`Discount: Rs. ${bill.discount.toFixed(2)}`);
  doc.moveDown().fontSize(16).text(`Grand Total: Rs. ${bill.totalAmount.toFixed(2)}`);
  doc.end();

  return new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
}
