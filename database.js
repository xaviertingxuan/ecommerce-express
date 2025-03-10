//module = is a JS file
//module.exports = is a JS object
//functions or variables that are exported are available to other modules

const mysql = require('mysql2/promise');


//why use connection pooling?
//it is a technique used to improve performance in a database
//it is a cache of database connections
//it is a way to reuse connections
//it is a way to manage connections
//it is a way to limit the number of connections

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, //maximum number of connections
    queueLimit: 0 //maximum number of connection requests in the queue, infinite client can be in the queue
  });

module.exports = pool;