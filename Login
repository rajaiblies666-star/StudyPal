import mysql from mysql2

export default function handler(req, res) { const db = mysql.createConnection(process.env.DB_URL)

db.query("SELECT 1 AS ok", (err, rows) => { if (err) { return res.json({ error: err.message }) } res.json({ status: rows }) }) }
