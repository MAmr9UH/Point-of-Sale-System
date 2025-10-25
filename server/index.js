import http from 'http';
import { handleWelcome } from './routes/welcome.js';
import { handleAuth } from './routes/auth.js';
import { handleMenu } from './routes/menuData.js';
import { handleCheckout } from './routes/checkout.js';
import './db/connection.js';

const hostname = '0.0.0.0';
const port = 3000;

const server = http.createServer((req, res) => {
    const { url, method } = req;
    console.log(`${method} request for ${url}`);
    
    if (method === 'GET' && url === '/api') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end('<h1>Welcome to the Homepage!</h1><p>This is a plain Node.js server.</p>');
    } else if (url.startsWith('/api/menu')) {  // ← Use handleMenu
        handleMenu(req, res);
    } else if (url.startsWith('/api/welcome')) {
        handleWelcome(req, res);
    } else if (url.startsWith('/api/auth')) {
        handleAuth(req, res);
    } else if (url.startsWith('/api/checkout')) {
        handleCheckout(req, res);
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