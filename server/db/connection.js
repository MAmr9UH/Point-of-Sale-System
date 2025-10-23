import mysql from 'mysql2'
import { loadEnv } from '../loadEnv.js';

loadEnv();

export const db = mysql.createConnection({
    host: process.env.URL || 'localhost',
    user: process.env.USER || 'root',
    password: process.env.PASSWORD || 'admin',
    port: process.env.PORT || '3306',
    database: process.env.DATABASE || 'pos',
    ssl: {
        rejectUnauthorized: false
    }
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database.');

    db.query("SELECT * FROM pos.Location", (err, results) => {
        console.log(results);
    })

});