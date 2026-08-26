const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = __dirname;
const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

function safeReadJson(filePath, defaultValue = []) {
  if (!fs.existsSync(filePath)) return defaultValue;
  try {
    const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading JSON from', filePath, err.message);
    return defaultValue;
  }
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const clean = body.replace(/^\uFEFF/, '');
        const json = clean ? JSON.parse(clean) : {};
        resolve(json);
      } catch (err) {
        resolve(body);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  const [reqPath] = req.url.split('?');

  if (reqPath.startsWith('/api/')) {
    try {
      if (req.method === 'POST') {
        const payload = await readRequestBody(req);

        if (reqPath === '/api/save-notices') {
          fs.writeFileSync(path.join(DATA_DIR, 'notices.json'), JSON.stringify(payload, null, 2), 'utf8');
          return sendJson(res, 200, { success: true, message: 'Notices saved successfully', count: payload.length });
        }

        if (reqPath === '/api/save-services') {
          fs.writeFileSync(path.join(DATA_DIR, 'services.json'), JSON.stringify(payload, null, 2), 'utf8');
          return sendJson(res, 200, { success: true, message: 'Services saved successfully', count: payload.length });
        }

        if (reqPath === '/api/save-config') {
          fs.writeFileSync(path.join(DATA_DIR, 'site_config.json'), JSON.stringify(payload, null, 2), 'utf8');
          return sendJson(res, 200, { success: true, message: 'Site configuration saved successfully' });
        }

        if (reqPath === '/api/save-feedbacks') {
          fs.writeFileSync(path.join(DATA_DIR, 'feedbacks.json'), JSON.stringify(payload, null, 2), 'utf8');
          return sendJson(res, 200, { success: true, message: 'Feedbacks updated successfully', count: payload.length });
        }

        if (reqPath === '/api/save-dictionary') {
          fs.writeFileSync(path.join(DATA_DIR, 'converter_dict.json'), JSON.stringify(payload, null, 2), 'utf8');
          return sendJson(res, 200, { success: true, message: 'Converter dictionary saved successfully', count: payload.length });
        }

        if (reqPath === '/api/submit-feedback') {
          const list = safeReadJson(path.join(DATA_DIR, 'feedbacks.json'), []);
          const newEntry = {
            id: 'fb-' + Date.now(),
            name: payload.name || 'বেনামী গ্রাহক',
            contact: payload.contact || '',
            category: payload.category || 'সাধারণ মতামত',
            message: payload.message || '',
            rating: payload.rating || 5,
            status: 'pending',
            date: new Date().toISOString()
          };
          list.unshift(newEntry);
          fs.writeFileSync(path.join(DATA_DIR, 'feedbacks.json'), JSON.stringify(list, null, 2), 'utf8');
          return sendJson(res, 200, { success: true, message: 'Feedback submitted successfully', feedback: newEntry });
        }

        if (reqPath === '/api/sync-github') {
          const { exec } = require('child_process');
          exec('powershell.exe -NoProfile -ExecutionPolicy Bypass -File "sync-to-github.ps1"', { cwd: __dirname }, (error, stdout, stderr) => {
            if (error) {
              console.error('GitHub Sync Error:', error);
            } else {
              console.log('GitHub Sync Completed successfully');
            }
          });
          return sendJson(res, 200, { success: true, message: 'গিটহাব সিঙ্ক শুরু হয়েছে, ব্যাকগ্রাউন্ডে আপলোড সম্পন্ন হচ্ছে।' });
        }

        if (reqPath === '/api/import-backup') {
          if (payload.notices) fs.writeFileSync(path.join(DATA_DIR, 'notices.json'), JSON.stringify(payload.notices, null, 2), 'utf8');
          if (payload.services) fs.writeFileSync(path.join(DATA_DIR, 'services.json'), JSON.stringify(payload.services, null, 2), 'utf8');
          if (payload.config) fs.writeFileSync(path.join(DATA_DIR, 'site_config.json'), JSON.stringify(payload.config, null, 2), 'utf8');
          if (payload.feedbacks) fs.writeFileSync(path.join(DATA_DIR, 'feedbacks.json'), JSON.stringify(payload.feedbacks, null, 2), 'utf8');
          if (payload.dictionary) fs.writeFileSync(path.join(DATA_DIR, 'converter_dict.json'), JSON.stringify(payload.dictionary, null, 2), 'utf8');
          return sendJson(res, 200, { success: true, message: 'Backup restored successfully' });
        }
      }

      if (req.method === 'GET') {
        if (reqPath === '/api/feedbacks') {
          const list = safeReadJson(path.join(DATA_DIR, 'feedbacks.json'), []);
          return sendJson(res, 200, list);
        }

        if (reqPath === '/api/config') {
          const cfg = safeReadJson(path.join(DATA_DIR, 'site_config.json'), {});
          return sendJson(res, 200, cfg);
        }

        if (reqPath === '/api/dictionary') {
          const dict = safeReadJson(path.join(DATA_DIR, 'converter_dict.json'), []);
          return sendJson(res, 200, dict);
        }

        if (reqPath === '/api/export-backup') {
          const backup = {
            version: '2.0',
            timestamp: new Date().toISOString(),
            notices: safeReadJson(path.join(DATA_DIR, 'notices.json'), []),
            services: safeReadJson(path.join(DATA_DIR, 'services.json'), []),
            config: safeReadJson(path.join(DATA_DIR, 'site_config.json'), {}),
            feedbacks: safeReadJson(path.join(DATA_DIR, 'feedbacks.json'), []),
            dictionary: safeReadJson(path.join(DATA_DIR, 'converter_dict.json'), [])
          };
          return sendJson(res, 200, backup);
        }
      }

      return sendJson(res, 404, { error: 'API route not found' });
    } catch (err) {
      console.error('API Error:', err);
      return sendJson(res, 500, { error: err.message });
    }
  }

  let staticPath = reqPath;
  if (staticPath === '/' || staticPath === '') staticPath = '/index.html';
  
  const filePath = path.join(PUBLIC_DIR, staticPath);
  const ext = path.extname(filePath).toLowerCase();
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});