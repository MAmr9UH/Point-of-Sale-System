import mysql from 'mysql2/promise'
import { loadEnv } from '../loadEnv.js';

loadEnv();

export const db = await mysql.createConnection({
    host: process.env.DB_URL || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'admin',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'pos',
    ssl: {
        rejectUnauthorized: false
    }
});

console.log('Connected to the database.');
