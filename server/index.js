import http from 'http';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleWelcome } from './routes/welcome.js';
import { handleAuth } from './routes/auth.js';
import { handleMenu } from './routes/menuData.js';
import { handleCheckout } from './routes/checkout.js';
import { handleInventoryRoutes } from './routes/inventoryRoutes.js';
import { handleUtilityRoutes } from './routes/utilityRoutes.js';
import { handleMenuRoutes } from './routes/menuRoutes.js';
import { handleEditPage } from './routes/editpage.js';

import './db/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { handleReports } from "./routes/reportsData.js"


const hostname = '0.0.0.0';
const port = 3000;

async function serveStaticFile(req, res) {
    try {
        const filepath = path.join(__dirname, req.url);
        const data = await fs.readFile(filepath);
        
        // Determine content type
        const ext = path.extname(filepath).toLowerCase();
        const contentTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml'
        };
        
        res.statusCode = 200;
        res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(data);
    } catch (error) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html');
        res.end('<h1>404 - File Not Found</h1>');
    }
}


const server = http.createServer((req, res) => {
    const { url, method } = req;
    console.log(`${method} request for ${url}`);
    // Serve static files from uploads directory
    if (url.startsWith('/uploads/')) {
        serveStaticFile(req, res);
        return;
    }
    if (method === 'GET' && url === '/api') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end('<h1>Welcome to the Homepage!</h1><p>This is a plain Node.js server.</p>');
    } else if (url.startsWith('/api/editpage')) {
        handleEditPage(req, res);
    } else if (url.startsWith('/api/menu/')) {
        handleMenu(req, res);
    } else if (url.startsWith('/api/welcome')) {
        handleWelcome(req, res);
    } else if (url.startsWith('/api/auth')) {
        handleAuth(req, res);
    } else if (url.startsWith('/api/checkout')) {
        handleCheckout(req, res);
    } else if (url.startsWith('/api/inventory')) {
        handleInventoryRoutes(req, res);
    } else if (url.startsWith('/api/utilities')) {
        handleUtilityRoutes(req, res);
    } else if (url.startsWith('/api/reports')) {
        handleReports(req, res); 
    } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html');
        res.end('<h1>404 - Page Not Found</h1><p>The requested URL was not found on this server.</p>');
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
    console.log('Press Ctrl+C to stop the server.');
});