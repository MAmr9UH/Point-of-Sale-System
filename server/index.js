// Import the built-in 'http' module
import http from 'http';
import { handleWelcome } from './routes/welcome.js';
import { handleAuth } from './routes/auth.js';


const hostname = '0.0.0.0';
const port = 3000;


const server = http.createServer((req, res) => {
    const { url, method } = req;
    console.log(`${method} request for ${url}`);
    if (method === 'GET' && url === '/api') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end('<h1>Welcome to the Homepage!</h1><p>This is a plain Node.js server.</p>');
    } else if (method === 'GET' && url === '/api/menuItems') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(menuItems));
        // http://localhost:3000/api/welcomeData
    } else if (url.startsWith('/api/welcome')) {
        handleWelcome(req, res);
    } else if (url.startsWith('/api/auth')) {
        handleAuth(req, res);
    } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html');
        res.end('<h1>404 - Page Not Found</h1><p>The requested URL was not found on this server.</p>');
    }
});

// Start the server and have it listen on the specified port and hostname.
// The callback function is executed once the server starts listening.
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
    console.log('Press Ctrl+C to stop the server.');
});
