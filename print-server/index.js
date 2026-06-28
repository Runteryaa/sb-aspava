const express = require('express');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const receiptsDir = 'C:\\KirosyaPanel\\receipts';

// Klasör yoksa oluştur
if (!fs.existsSync('C:\\KirosyaPanel')) {
    fs.mkdirSync('C:\\KirosyaPanel');
}
if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir);
}

// Update check (mock)
const APP_VERSION = "0.0.1";
console.log(`KirosyaPanel v${APP_VERSION} Başlatılıyor...`);

const replaceTrChars = (text) => {
    if (!text) return text;
    return text.replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
               .replace(/ü/g, 'u').replace(/Ü/g, 'U')
               .replace(/ş/g, 's').replace(/Ş/g, 'S')
               .replace(/ı/g, 'i').replace(/İ/g, 'I')
               .replace(/ö/g, 'o').replace(/Ö/g, 'O')
               .replace(/ç/g, 'c').replace(/Ç/g, 'C');
};

app.post('/print', (req, res) => {
    try {
        const { tableId, items, orderId } = req.body;
        if (!items || !tableId) {
            return res.status(400).json({ error: 'Missing tableId or items' });
        }

        const fileName = `fis_masa_${tableId}_siparis_${orderId || Date.now()}.pdf`;
        const filePath = path.join(receiptsDir, fileName);

        // 80mm thermal paper width is approximately 226 points.
        const doc = new PDFDocument({
            size: [226, 800], // 80mm x approx 28cm
            margin: 15
        });

        doc.pipe(fs.createWriteStream(filePath));

        // Header
        doc.font('Helvetica-Bold')
           .fontSize(16)
           .text('SB ASPAVA', { align: 'center' });
        
        doc.moveDown(0.5);
        doc.fontSize(12).text('--------------------------------', { align: 'center' });
        
        // Table Info
        doc.fontSize(14).text(`Masa: ${tableId}`, { align: 'center' });
        if (orderId) {
            doc.fontSize(10).font('Helvetica').text(`Siparis No: ${orderId}`, { align: 'center' });
        }
        
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica-Bold').text('--------------------------------', { align: 'center' });
        doc.moveDown(0.5);

        // Items
        let total = 0;
        doc.font('Helvetica').fontSize(12);
        
        items.forEach(item => {
            const itemTotal = item.price * item.qty;
            total += itemTotal;
            
            // Format: Qty x Name
            doc.text(`${item.qty}x ${replaceTrChars(item.name)}`, { continued: true });
            // Format: Price (right aligned)
            doc.text(`${itemTotal} TL`, { align: 'right' });
            doc.moveDown(0.2);
        });

        doc.moveDown(0.5);

        // Total
        doc.fontSize(14).text('TOPLAM:', { continued: true });
        doc.text(`${total} TL`, { align: 'right' });

        doc.moveDown(2);
        doc.text(new Date().toLocaleString('tr-TR'), { align: 'center' });

        doc.end();

        console.log(`[+] Fiş oluşturuldu: ${fileName}`);
        res.json({ success: true, message: 'PDF fiş başarıyla oluşturuldu', file: fileName });
    } catch (error) {
        console.error('PDF oluşturma hatası:', error);
        res.status(500).json({ error: 'PDF oluşturulamadı' });
    }
});

const PORT = 8181;
app.listen(PORT, () => {
    console.log(`
=========================================
 ASPAVA LOKAL YAZDIRMA SUNUCUSU ÇALIŞIYOR
=========================================
Port: ${PORT}
Fişlerin kaydedileceği klasör: ${receiptsDir}
Admin panelinden yazdırılan siparişler buraya PDF olarak düşecektir.
    `);
});
