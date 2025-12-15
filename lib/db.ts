import mysql from "mysql2/promise";

const pool = mysql.createPool({
    host: "localhost",
    user: "itteam",
    password: "@LCGCit123",
    database: "scid",
});

export default pool;
