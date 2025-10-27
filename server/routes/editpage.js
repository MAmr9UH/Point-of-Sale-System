import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
async function ensureUploadsDir() {
    try {
        await fs.access(uploadsDir);
    } catch {
        await fs.mkdir(uploadsDir, { recursive: true });
    }
}

// Parse multipart form data for file uploads
async function parseMultipartFormData(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        const chunks = [];

        req.on('data', (chunk) => {
            chunks.push(chunk);
        });

        req.on('end', async () => {
            try {
                const buffer = Buffer.concat(chunks);
                const boundary = req.headers['content-type'].split('boundary=')[1];

                if (!boundary) {
                    reject(new Error('No boundary found'));
                    return;
                }

                const parts = buffer.toString('binary').split(`--${boundary}`);
                const result = {};

                for (const part of parts) {
                    if (part.includes('Content-Disposition')) {
                        const nameMatch = part.match(/name="([^"]+)"/);
                        const filenameMatch = part.match(/filename="([^"]+)"/);

                        if (nameMatch) {
                            const fieldName = nameMatch[1];

                            if (filenameMatch) {
                                // This is a file field
                                const filename = filenameMatch[1];
                                const contentTypeMatch = part.match(/Content-Type: (.+)/);
                                const contentType = contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream';

                                // Extract file data (after double CRLF)
                                const dataStart = part.indexOf('\r\n\r\n') + 4;
                                const dataEnd = part.lastIndexOf('\r\n');
                                const fileData = part.substring(dataStart, dataEnd);

                                result[fieldName] = {
                                    filename,
                                    contentType,
                                    data: Buffer.from(fileData, 'binary')
                                };
                            } else {
                                // This is a regular field
                                const dataStart = part.indexOf('\r\n\r\n') + 4;
                                const dataEnd = part.lastIndexOf('\r\n');
                                result[fieldName] = part.substring(dataStart, dataEnd);
                            }
                        }
                    }
                }

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });

        req.on('error', reject);
    });
}

// Handle file upload
async function handleFileUpload(req, res) {
    if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }

    try {
        await ensureUploadsDir();

        const formData = await parseMultipartFormData(req);

        if (!formData.image || !formData.image.filename) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'No file uploaded' }));
            return;
        }

        const file = formData.image;
        const timestamp = Date.now();
        const ext = path.extname(file.filename);
        const safeFilename = `landing-bg-${timestamp}${ext}`;
        const filepath = path.join(uploadsDir, safeFilename);

        // Save the file
        await fs.writeFile(filepath, file.data);

        // Return the URL
        const imageUrl = `/uploads/${safeFilename}`;

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            success: true,
            imageUrl,
            filename: safeFilename
        }));

    } catch (error) {
        console.error('File upload error:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            error: 'File upload failed',
            details: error.message
        }));
    }
}
import { db } from '../db/connection.js';
import { getCurrentActiveLocations } from '../model/ActiveLocation.js';

export async function handleEditPage(req, res) {
    const { url, method } = req;

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
    }

    if (url === '/api/editpage/upload') {
        await handleFileUpload(req, res);
    } else if (url === '/api/editpage/content' && method === 'GET') {
        

    } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Not found' }));
    }
}
