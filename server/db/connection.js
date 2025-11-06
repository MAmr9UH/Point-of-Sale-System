import mysql from 'mysql2/promise'
import { loadEnv } from '../loadEnv.js';

loadEnv();

export const db = await mysql.createConnection({
    host: "team4-mysql-server.mysql.database.azure.com",
    user: "pos3380",
    password: "F@@dtruckpos",
    port: "3306",
    database: "pos",
    ssl: {
        rejectUnauthorized: false
    }
});

console.log('Connected to the database.');
