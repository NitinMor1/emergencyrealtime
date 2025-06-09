const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function convertToPDF() {
    console.log('🚀 Starting PDF conversion...');
    
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        
        console.log('✅ Browser launched successfully');

        const page = await browser.newPage();
        
        // Load the HTML file
        const htmlPath = path.join(__dirname, 'Flutter_WebSocket_Integration_Interactive.html');
        console.log(`📄 Loading HTML file: ${htmlPath}`);
        
        if (!fs.existsSync(htmlPath)) {
            throw new Error(`HTML file not found: ${htmlPath}`);
        }
        
        const fileUrl = 'file://' + htmlPath.replace(/\\/g, '/');
        console.log(`🌐 Loading URL: ${fileUrl}`);
        
        await page.goto(fileUrl, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });
        
        console.log('✅ Page loaded successfully');

        // Generate PDF
        const pdfPath = path.join(__dirname, 'Flutter_WebSocket_Integration_Guide.pdf');
        console.log(`📝 Generating PDF: ${pdfPath}`);
        
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm'
            },
            displayHeaderFooter: true,
            headerTemplate: `
                <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
                    Flutter WebSocket Integration Guide - HPlus Medical System
                </div>
            `,
            footerTemplate: `
                <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
                    <span class="pageNumber"></span> / <span class="totalPages"></span>
                </div>
            `,
            preferCSSPageSize: false,
            scale: 0.8
        });

        console.log(`✅ PDF generated successfully: ${pdfPath}`);
        
        if (fs.existsSync(pdfPath)) {
            const stats = fs.statSync(pdfPath);
            console.log(`📄 File size: ${Math.round(stats.size / 1024)} KB`);
        }

    } catch (error) {
        console.error('❌ Error generating PDF:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        if (browser) {
            await browser.close();
            console.log('🔒 Browser closed');
        }
    }
}

convertToPDF();
