const mysql = require('mysql2/promise');

const conn = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'webdb',
    port: 9000,
    timezone:'+07:00'
});

module.exports = conn;