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
  console.log('[CARD SAVE] Starting card save operation');
  console.log('[CARD SAVE] Payload received:', JSON.stringify(req.body, null, 2));
  
  const payload = req.body;
  const tempFile = path.join(__dirname, 'temp_card.json');
  const scriptPath = path.join(__dirname, 'scripts', 'modify_cards.py');
  const cardsJsonPath = path.join(__dirname, 'data', 'cards.json');

  // Log file paths
  console.log('[CARD SAVE] Temp file path:', tempFile);
  console.log('[CARD SAVE] Script path:', scriptPath);
  console.log('[CARD SAVE] Cards.json path:', cardsJsonPath);

  // Check if cards.json exists and log its size
  try {
    if (fs.existsSync(cardsJsonPath)) {
      const stats = fs.statSync(cardsJsonPath);
      console.log('[CARD SAVE] Cards.json exists, size:', stats.size, 'bytes');
    } else {
      console.log('[CARD SAVE] WARNING: Cards.json does not exist!');
    }
  } catch (err) {
    console.log('[CARD SAVE] Error checking cards.json:', err.message);
  }

  // Write payload to temp file
  try {
    fs.writeFileSync(tempFile, JSON.stringify(payload, null, 2), 'utf-8');
    console.log('[CARD SAVE] Temp file written successfully');
  } catch (err) {
    console.error('[CARD SAVE] Error writing temp file:', err);
    return res.status(500).json({ success: false, error: 'Failed to write temp file' });
  }

  // Run the Python script
  console.log('[CARD SAVE] Executing Python script...');
  exec(`python "${scriptPath}" "${tempFile}"`, (error, stdout, stderr) => {
    // Clean up temp file
    try {
      fs.unlinkSync(tempFile);
      console.log('[CARD SAVE] Temp file cleaned up');
    } catch (cleanupErr) {
      console.log('[CARD SAVE] Warning: Could not clean up temp file:', cleanupErr.message);
    }

    if (error) {
      console.error('[CARD SAVE] Python script error:', error);
      console.error('[CARD SAVE] Python stderr:', stderr);
      return res.status(500).json({ success: false, error: stderr || error.message });
    }

    console.log('[CARD SAVE] Python script stdout:', stdout);
    console.log('[CARD SAVE] Card save operation completed successfully');
    
    // Check if cards.json was modified
    try {
      if (fs.existsSync(cardsJsonPath)) {
        const stats = fs.statSync(cardsJsonPath);
        console.log('[CARD SAVE] Cards.json after save, size:', stats.size, 'bytes');
      }
    } catch (err) {
      console.log('[CARD SAVE] Error checking cards.json after save:', err.message);
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
  console.log('[IMAGE UPLOAD] Starting image upload operation');
  console.log('[IMAGE UPLOAD] File received:', req.file ? {
    originalname: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype
  } : 'No file');
  console.log('[IMAGE UPLOAD] Target directory:', req.body.targetDir);

  const file = req.file;
  const targetDir = req.body.targetDir;
  if (!file || !targetDir) {
    console.log('[IMAGE UPLOAD] Missing file or targetDir');
    return res.status(400).json({ success: false, error: 'Missing file or targetDir' });
  }

  // Determine final destination
  let destDir;
  if (targetDir === 'command') {
    destDir = path.join(__dirname, 'src', 'images', 'command');
  } else {
    destDir = path.join(__dirname, 'src', 'images', 'deployment');
  }

  console.log('[IMAGE UPLOAD] Destination directory:', destDir);

  // Ensure directory exists
  if (!fs.existsSync(destDir)) {
    console.log('[IMAGE UPLOAD] Creating directory:', destDir);
    fs.mkdirSync(destDir, { recursive: true });
  } else {
    console.log('[IMAGE UPLOAD] Directory already exists');
  }

  // Move and rename the file
  const destPath = path.join(destDir, file.originalname);
  console.log('[IMAGE UPLOAD] Moving file to:', destPath);
  
  fs.rename(file.path, destPath, (err) => {
    if (err) {
      console.error('[IMAGE UPLOAD] Error moving file:', err);
      return res.status(500).json({ success: false, error: 'Failed to save image.' });
    }
    
    console.log('[IMAGE UPLOAD] File moved successfully, generating thumbnail...');
    
    // Call Python thumbnail script
    const scriptPath = path.join(__dirname, 'scripts', 'generate_thumbnail.py');
    console.log('[IMAGE UPLOAD] Thumbnail script path:', scriptPath);
    
    exec(`python "${scriptPath}" "${destPath}" "${targetDir}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('[IMAGE UPLOAD] Thumbnail generation error:', error, stderr);
        // Still return success for image upload, but log the error
        return res.json({ success: true, thumbnail: false, error: stderr });
      }
      
      console.log('[IMAGE UPLOAD] Thumbnail generated successfully:', stdout);
      res.json({ success: true, thumbnail: true });
    });
  });
});

app.post('/api/delete-image', (req, res) => {
  const { imageName, targetDir } = req.body;
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
  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      return res.status(500).json({ success: false, error: 'Failed to delete image.' });
    }
    // Also delete the thumbnail
    const ext = path.extname(imageName);
    const baseName = path.basename(imageName, ext);
    const thumbDir = path.join(destDir, 'thumbnails');
    const thumbPath = path.join(thumbDir, baseName + '.jpg');
    fs.unlink(thumbPath, (thumbErr) => {
      if (thumbErr && thumbErr.code !== 'ENOENT') {
        return res.json({ success: true, thumbnail: false, error: thumbErr.message });
      }
      res.json({ success: true, thumbnail: !thumbErr });
    });
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

app.get('/api/cards', (req, res) => {
  console.log('[CARDS API] Loading cards.json from server');
  const cardsJsonPath = path.join(__dirname, 'data', 'cards.json');
  
  try {
    if (!fs.existsSync(cardsJsonPath)) {
      console.log('[CARDS API] ERROR: Cards.json not found');
      return res.status(404).json({ error: 'Cards data not found' });
    }
    
    const cardsData = JSON.parse(fs.readFileSync(cardsJsonPath, 'utf-8'));
    console.log(`[CARDS API] Loaded ${cardsData.length} cards from server`);
    res.json(cardsData);
  } catch (error) {
    console.error('[CARDS API] Error loading cards:', error);
    res.status(500).json({ error: 'Failed to load cards data' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
  console.log(`[STARTUP] Node.js version: ${process.version}`);
  console.log(`[STARTUP] Working directory: ${__dirname}`);
  console.log(`[STARTUP] Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Check critical files and directories
  const cardsJsonPath = path.join(__dirname, 'data', 'cards.json');
  const scriptsDir = path.join(__dirname, 'scripts');
  const imagesDir = path.join(__dirname, 'images');
  
  console.log(`[STARTUP] Cards.json exists: ${fs.existsSync(cardsJsonPath)}`);
  console.log(`[STARTUP] Scripts directory exists: ${fs.existsSync(scriptsDir)}`);
  console.log(`[STARTUP] Images directory exists: ${fs.existsSync(imagesDir)}`);
  
  // Debug: List what's actually in the working directory
  console.log(`[STARTUP] Contents of working directory:`);
  try {
    const contents = fs.readdirSync(__dirname);
    contents.forEach(item => {
      const itemPath = path.join(__dirname, item);
      const isDir = fs.statSync(itemPath).isDirectory();
      console.log(`[STARTUP]   ${isDir ? 'DIR' : 'FILE'}: ${item}`);
    });
  } catch (err) {
    console.log(`[STARTUP] Error listing directory contents: ${err.message}`);
  }
  
  if (fs.existsSync(cardsJsonPath)) {
    const stats = fs.statSync(cardsJsonPath);
    console.log(`[STARTUP] Cards.json size: ${stats.size} bytes`);
  }
  
  // Check Python availability
  exec('python --version', (error, stdout, stderr) => {
    if (error) {
      console.log(`[STARTUP] Python check failed: ${error.message}`);
    } else {
      console.log(`[STARTUP] Python version: ${stdout.trim()}`);
    }
  });
}); 