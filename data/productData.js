const pool = require('../database.js');

//when we store data as decimal in mysql, it is stored as string
//so we need to cast it to double

async function getAllProducts() {
    const [rows] = await pool.query('SELECT id, name, CAST(price AS DOUBLE) AS price, image FROM products');
    return rows;
}

async function getProductById (params) {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0];
}