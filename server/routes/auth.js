export const handleAuth = (req, res) => {
    const { method, url } = req;
    if (method === 'POST' && url === '/api/auth/login') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ name: "UH " }));
        const body = req.body;

    } else if (method === 'POST' && url === '/api/auth/test') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: "Test endpoint reached" }));
    } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: "Not Found" }));
    }
};