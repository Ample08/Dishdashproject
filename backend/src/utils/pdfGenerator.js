const PDFDocument = require('pdfkit');

const generatePaginatedPdf = (rows, columns, title = 'Report') => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(18).text(title, { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' });
      doc.moveDown();

      if (!rows.length) {
        doc.fontSize(12).text('No records found.');
        doc.end();
        return;
      }

      const colWidth = (doc.page.width - 80) / columns.length;
      let y = doc.y;

      doc.fontSize(11).font('Helvetica-Bold');
      columns.forEach((col, i) => {
        doc.text(String(col.label), 40 + i * colWidth, y, { width: colWidth - 5 });
      });

      y += 20;
      doc.moveTo(40, y).lineTo(doc.page.width - 40, y).stroke();
      y += 10;

      doc.font('Helvetica').fontSize(10);
      rows.forEach((row) => {
        if (y > doc.page.height - 60) {
          doc.addPage();
          y = 40;
        }

        columns.forEach((col, i) => {
          const value = row[col.key];
          doc.text(value != null ? String(value) : '-', 40 + i * colWidth, y, {
            width: colWidth - 5,
          });
        });
        y += 18;
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generatePaginatedPdf };
