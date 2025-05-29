import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { resolve, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const port = process.argv.includes('--port') ? parseInt(process.argv[process.argv.indexOf('--port') + 1]) || 3000 : 3001;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.mjs': 'application/javascript',
  '.json': 'application/json'
};

const server = createServer((req, res) => {
  let filePath = req.url === '/' ? '/index.html' : req.url;
  
  // Remove query parameters
  filePath = filePath.split('?')[0];
  
  const fullPath = resolve(__dirname + filePath);
  
  if (!existsSync(fullPath)) {
    res.writeHead(404);
    res.end('File not found');
    return;
  }
  
  const ext = extname(fullPath);
  const contentType = mimeTypes[ext] || 'text/plain';
  
  try {
    const content = readFileSync(fullPath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (err) {
    res.writeHead(500);
    res.end('Server error');
  }
});

server.listen(port, () => {
  console.log(`🚀 Demo server running at http://localhost:${port}`);
  console.log('📁 Serving files from:', __dirname);
});
