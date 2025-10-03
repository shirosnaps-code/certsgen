const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/generate', async (req, res) => {
  const { name, course, date } = req.body;

  let html = fs.readFileSync(path.join(__dirname, 'certificate-template.html'), 'utf8');

  html = html
    .replace('{{name}}', name)
    .replace('{{course}}', course)
    .replace('{{date}}', date);

  try {
    const browser = await puppeteer.launch({
		headless: true,
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
	});

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 1000)); // extra wait

    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
    });

    await browser.close();

    // Optionally save locally for debugging:
    // fs.writeFileSync(path.join(__dirname, 'debug_certificate.pdf'), pdfBuffer);

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${name.replace(/\s+/g, '_')}_certificate.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);

  } catch (error) {
    console.error('PDF Generation Failed:', error);
    res.status(500).send('Error generating certificate.');
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
