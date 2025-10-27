import mysql from 'mysql2/promise'
import { loadEnv } from '../loadEnv.js';

loadEnv();

export const db = await mysql.createConnection({
    host: process.env.URL || 'localhost',
    user: process.env.USER || 'root',
    password: process.env.PASSWORD || 'F@@dtruckpos',
    port: process.env.PORT || '3306',
    database: process.env.DATABASE || 'pos',
    ssl: {
        rejectUnauthorized: false
    }
});

console.log('Connected to the database.');
