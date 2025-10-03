const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const pdf = require('html-pdf'); // Using html-pdf package
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the form page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle form submission
app.post('/generate', (req, res) => {
  const { name, course, date } = req.body;

  // Load the certificate template HTML
  let html = fs.readFileSync(path.join(__dirname, 'certificate-template.html'), 'utf8');

  // Replace placeholders with actual values safely
  html = html
    .replace('{{name}}', name)
    .replace('{{course}}', course)
    .replace('{{date}}', date);

  // PDF generation options
  const options = {
    format: 'A4',
    orientation: 'landscape',
    border: '0',       // No margin — border is handled via CSS in the HTML
    type: 'pdf',
    quality: '100',
    zoom: 1.0,      // Optional: adjust zoom if you need to tweak sizing
  };

  pdf.create(html, options).toBuffer((err, buffer) => {
    if (err) {
      console.error('PDF Generation Failed:', err);
      return res.status(500).send('Error generating certificate.');
    }

    // Set response headers for PDF download
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${name.replace(/\s+/g, '_')}_certificate.pdf"`,
      'Content-Length': buffer.length,
    });

    // Send generated PDF buffer as response
    res.send(buffer);
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});


const options = {
  format: 'A4',
  orientation: 'landscape',
  border: '0',
};
