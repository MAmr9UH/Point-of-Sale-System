import mysql from 'mysql2/promise'
import { loadEnv } from '../loadEnv.js';

loadEnv();

export const db = await mysql.createConnection({
    host: process.env.DB_URL || 'localhost',
    user: process.env.DB_USER || 'pos3380',
    password: process.env.DB_PASSWORD || 'F@@dtruckpos',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'pos',
    ssl: {
        rejectUnauthorized: false
    }
});

console.log('Connected to the database.');
