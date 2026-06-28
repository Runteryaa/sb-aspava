const { app, Tray, Menu, dialog, shell } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

// Setup Auto Updater
autoUpdater.autoDownload = false;
autoUpdater.on('update-available', (info) => {
    dialog.showMessageBox({
        type: 'info',
        title: 'Güncelleme Mevcut',
        message: `KirosyaPanel'in ${info.version} sürümü mevcut. Şimdi indirmek ister misiniz?`,
        buttons: ['Evet', 'Hayır']
    }).then(result => {
        if (result.response === 0) {
            autoUpdater.downloadUpdate();
        }
    });
});
autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
        title: 'Güncelleme Hazır',
        message: 'Güncelleme indirildi. Şimdi yeniden başlatıp kurmak ister misiniz?',
        buttons: ['Kur ve Yeniden Başlat', 'Daha Sonra']
    }).then(result => {
        if (result.response === 0) {
            autoUpdater.quitAndInstall(false, true);
        }
    });
});

let tray = null;
const expressApp = express();
expressApp.use(cors());
expressApp.use(express.json());

// Set up receipts directory in C:\KirosyaPanel
const installDir = 'C:\\KirosyaPanel';
if (!fs.existsSync(installDir)) {
    try { fs.mkdirSync(installDir, { recursive: true }); } catch (e) {}
}
const receiptsDir = path.join(installDir, 'receipts');
if (!fs.existsSync(receiptsDir)) {
    try { fs.mkdirSync(receiptsDir, { recursive: true }); } catch (e) {}
}

// Ensure single instance
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
}

app.on('ready', () => {
    // Start on boot setting
    app.setLoginItemSettings({
        openAtLogin: true,
        path: app.getPath('exe')
    });

    if (app.dock) app.dock.hide();
    
    // Create Tray with a base64 tiny icon
    const { nativeImage } = require('electron');
    const trayIcon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuPnAAAAAElFTkSuQmCC');
    tray = new Tray(trayIcon); 
    
    const contextMenu = Menu.buildFromTemplate([
        { label: 'KirosyaPanel v0.0.1', enabled: false },
        { type: 'separator' },
        { label: 'Fişleri Klasörde Aç', click: () => shell.openPath(receiptsDir) },
        { label: 'Güncellemeleri Kontrol Et', click: () => autoUpdater.checkForUpdatesAndNotify() },
        { type: 'separator' },
        { label: 'Çıkış', click: () => { app.quit(); } }
    ]);
    tray.setToolTip('KirosyaPanel Yazdırma Sunucusu');
    tray.setContextMenu(contextMenu);

    const replaceTrChars = (text) => {
        if (!text) return text;
        return text.replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
                   .replace(/ü/g, 'u').replace(/Ü/g, 'U')
                   .replace(/ş/g, 's').replace(/Ş/g, 'S')
                   .replace(/ı/g, 'i').replace(/İ/g, 'I')
                   .replace(/ö/g, 'o').replace(/Ö/g, 'O')
                   .replace(/ç/g, 'c').replace(/Ç/g, 'C');
    };

    expressApp.post('/print', (req, res) => {
        try {
            const { tableId, items, orderId } = req.body;
            if (!items || !tableId) {
                return res.status(400).json({ error: 'Missing tableId or items' });
            }

            const fileName = `fis_masa_${tableId}_siparis_${orderId || Date.now()}.pdf`;
            const filePath = path.join(receiptsDir, fileName);

            const doc = new PDFDocument({
                size: [226, 800],
                margin: 15
            });

            doc.pipe(fs.createWriteStream(filePath));

            doc.font('Helvetica-Bold')
               .fontSize(16)
               .text('SB ASPAVA', { align: 'center' });
            
            doc.moveDown(0.5);
            doc.fontSize(12).text('--------------------------------', { align: 'center' });
            
            doc.fontSize(14).text(`Masa: ${tableId}`, { align: 'center' });
            if (orderId) {
                doc.fontSize(10).font('Helvetica').text(`Siparis No: ${orderId}`, { align: 'center' });
            }
            
            doc.moveDown(0.5);
            doc.fontSize(12).font('Helvetica-Bold').text('--------------------------------', { align: 'center' });
            doc.moveDown(0.5);

            let total = 0;
            doc.font('Helvetica').fontSize(12);
            
            items.forEach(item => {
                const itemTotal = item.price * item.qty;
                total += itemTotal;
                
                doc.text(`${item.qty}x ${replaceTrChars(item.name)}`, { continued: true });
                doc.text(`${itemTotal} TL`, { align: 'right' });
                doc.moveDown(0.2);
            });

            doc.moveDown(0.5);

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

    expressApp.listen(8181, () => {
        console.log('Server started on 8181');
    });

    // Check for updates shortly after startup
    setTimeout(() => {
        autoUpdater.checkForUpdatesAndNotify();
    }, 5000);
});

app.on('window-all-closed', () => {
    // Do nothing, background tray app
});
