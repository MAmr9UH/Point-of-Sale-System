export const handleWelcome = (req, res) => {
    const { method, url } = req;
    if (method === 'GET' && url === '/api/welcome/welcomeData') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ name: "UH " }));
    } else if (method === 'GET' && url === '/api/welcome/test') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: "Test endpoint reached" }));
    } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: "Not Found" }));
    }
};