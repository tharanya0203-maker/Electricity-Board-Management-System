const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateReceipt = (paymentData, res) => {
  const doc = new PDFDocument();
  
  // Set response headers for PDF download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=receipt-${paymentData.transactionId}.pdf`
  );

  doc.pipe(res);

  // Add title
  doc.fontSize(20).text('Electricity Bill Receipt', { align: 'center' });
  doc.moveDown();

  // Add company information
  doc.fontSize(12).text('Smart Electricity Management System', { align: 'center' });
  doc.text('123 Energy Street, Power City', { align: 'center' });
  doc.text('Contact: +91-XXXXXXXXXX | Email: support@smartems.com', { align: 'center' });
  doc.moveDown();

  // Draw separator
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

  // Add customer information
  doc.fontSize(14).text('Customer Information:', { underline: true });
  doc.fontSize(12);
  doc.text(`Name: ${paymentData.name}`);
  doc.text(`EB ID: ${paymentData.ebId}`);
  doc.text(`Address: ${paymentData.address}`);
  doc.moveDown();

  // Add billing information
  doc.fontSize(14).text('Billing Information:', { underline: true });
  doc.fontSize(12);
  doc.text(`Billing Period: ${paymentData.month} ${paymentData.year}`);
  doc.text(`Units Consumed: ${paymentData.unitsConsumed} units`);
  doc.text(`Bill Amount: ₹${paymentData.billAmount}`);
  doc.text(`Due Amount: ₹${paymentData.dueAmount || 0}`);
  doc.text(`Total Amount: ₹${paymentData.totalAmount}`);
  doc.moveDown();

  // Add payment information
  doc.fontSize(14).text('Payment Information:', { underline: true });
  doc.fontSize(12);
  doc.text(`Amount Paid: ₹${paymentData.amountPaid}`);
  doc.text(`Transaction ID: ${paymentData.transactionId}`);
  doc.text(`Payment Date: ${paymentData.paymentDate || new Date().toLocaleDateString()}`);
  doc.text(`Payment Status: ${paymentData.status || 'Paid'}`);
  doc.moveDown();

  // Add tariff information
  doc.fontSize(14).text('Tariff Details:', { underline: true });
  doc.fontSize(12);
  doc.text('First 100 units: ₹3/unit');
  doc.text('101-200 units: ₹5/unit');
  doc.text('Above 200 units: ₹7/unit');
  doc.moveDown();

  // Add thank you message
  doc.fontSize(12).text('Thank you for using our electricity services!', { align: 'center' });
  doc.text('For any queries, contact our customer support.', { align: 'center' });

  // Finalize the PDF
  doc.end();
};

module.exports = generateReceipt;