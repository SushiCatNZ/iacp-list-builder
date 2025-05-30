const express = require('express');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '2mb' }));

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' }); // temp upload dir

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

app.post('/api/save-army', (req, res) => {
  const payload = req.body;
  const tempFile = path.join(__dirname, 'temp_payload.json');
  const scriptPath = path.join(__dirname, 'scripts', 'save_vsav.py');

  // Write payload to temp file
  fs.writeFileSync(tempFile, JSON.stringify(payload, null, 2), 'utf-8');

  // Run the Python script
  exec(`python "${scriptPath}" "${tempFile}"`, (error, stdout, stderr) => {
    // Clean up temp file
    fs.unlinkSync(tempFile);

    if (error) {
      console.error('Error:', error);
      return res.status(500).json({ success: false, error: stderr || error.message });
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${payload.armyName}.vsav"`);
    res.send(stdout);
  });
});

app.post('/api/save-list', (req, res) => {
  console.log("HIT /api/save-list", req.body);
  const payload = req.body;
  const tempFile = path.join(__dirname, 'temp_payload.json');
  const scriptPath = path.join(__dirname, 'scripts', 'save_vsav.py');

  // Write payload to temp file
  fs.writeFileSync(tempFile, JSON.stringify(payload, null, 2), 'utf-8');

  // Run the Python script
  exec(`python "${scriptPath}" "${tempFile}"`, (error, stdout, stderr) => {
    // Clean up temp file
    fs.unlinkSync(tempFile);

    if (error) {
      console.error('Error:', error);
      return res.status(500).json({ success: false, error: stderr || error.message });
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${payload.armyName}.vsav"`);
    res.send(stdout);
  });
});

app.post('/api/save-card', (req, res) => {
  const payload = req.body;
  const tempFile = path.join(__dirname, 'temp_card.json');
  const scriptPath = path.join(__dirname, 'scripts', 'modify_cards.py');

  // Write payload to temp file
  fs.writeFileSync(tempFile, JSON.stringify(payload, null, 2), 'utf-8');

  // Run the Python script
  exec(`python "${scriptPath}" "${tempFile}"`, (error, stdout, stderr) => {
    // Clean up temp file
    fs.unlinkSync(tempFile);

    if (error) {
      console.error('Error:', error);
      return res.status(500).json({ success: false, error: stderr || error.message });
    }
    res.json({ success: true, output: stdout });
  });
});

app.post('/api/delete-card', (req, res) => {
  const payload = req.body;
  const tempFile = path.join(__dirname, 'temp_card.json');
  const scriptPath = path.join(__dirname, 'scripts', 'modify_cards.py');

  // Write payload to temp file
  fs.writeFileSync(tempFile, JSON.stringify(payload, null, 2), 'utf-8');

  // Run the Python script
  exec(`python "${scriptPath}" "${tempFile}"`, (error, stdout, stderr) => {
    // Clean up temp file
    fs.unlinkSync(tempFile);

    if (error) {
      console.error('Error:', error);
      return res.status(500).json({ success: false, error: stderr || error.message });
    }
    res.json({ success: true, output: stdout });
  });
});

app.post('/api/upload-image', upload.single('image'), (req, res) => {
  const file = req.file;
  const targetDir = req.body.targetDir;
  if (!file || !targetDir) {
    return res.status(400).json({ success: false, error: 'Missing file or targetDir' });
  }

  // Determine final destination
  let destDir;
  if (targetDir === 'command') {
    destDir = path.join(__dirname, 'src', 'images', 'command');
  } else {
    destDir = path.join(__dirname, 'src', 'images', 'deployment');
  }

  // Ensure directory exists
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Move and rename the file
  const destPath = path.join(destDir, file.originalname);
  fs.rename(file.path, destPath, (err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Failed to save image.' });
    }
    res.json({ success: true });
  });
});

app.post('/api/delete-image', (req, res) => {
  const { imageName, targetDir } = req.body;
  console.log('Delete image request:', req.body);
  if (!imageName || !targetDir) {
    return res.status(400).json({ success: false, error: 'Missing imageName or targetDir' });
  }
  let destDir;
  if (targetDir === 'command') {
    destDir = path.join(__dirname, 'src', 'images', 'command');
  } else {
    destDir = path.join(__dirname, 'src', 'images', 'deployment');
  }
  const filePath = path.join(destDir, imageName);
  console.log('Attempting to delete file:', filePath);
  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Failed to delete image:', err);
      return res.status(500).json({ success: false, error: 'Failed to delete image.' });
    }
    res.json({ success: true });
  });
});

app.post('/api/upload-vassal', (req, res) => {
  const payload = req.body;
  const tempFile = path.join(__dirname, 'temp_vassal_payload.json');
  const scriptPath = path.join(__dirname, 'scripts', 'upload_vassal.py');

  // Write payload to temp file
  fs.writeFileSync(tempFile, JSON.stringify(payload, null, 2), 'utf-8');

  // Run the Python script
  exec(`python "${scriptPath}" "${tempFile}"`, (error, stdout, stderr) => {
    // Clean up temp file
    fs.unlinkSync(tempFile);

    if (error) {
      console.error('Error:', error);
      return res.status(500).json({ success: false, error: stderr || error.message });
    }
    try {
      const result = JSON.parse(stdout);
      res.json(result);
    } catch (parseErr) {
      res.status(500).json({ success: false, error: 'Failed to parse script output.' });
    }
  });
});

app.post('/api/delete-vassal-txt', (req, res) => {
  const { vassalName, cardGroup } = req.body;
  if (!vassalName || !cardGroup) {
    return res.status(400).json({ success: false, error: 'Missing vassalName or cardGroup' });
  }
  let destDir;
  if (cardGroup === 'Command') {
    destDir = path.join(__dirname, 'src', 'utils', 'vassal_comm');
  } else {
    destDir = path.join(__dirname, 'src', 'utils', 'vassal_depl');
  }
  const filePath = path.join(destDir, vassalName + '.txt');
  // Debug log
  console.log(`[VASSAL DELETE DEBUG] Attempting to delete file: ${filePath}`);
  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Failed to delete Vassal .txt file:', err);
      return res.status(500).json({ success: false, error: 'Failed to delete Vassal .txt file.' });
    }
    res.json({ success: true });
  });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Proxy is working!' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
}); 