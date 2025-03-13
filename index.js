const express = require('express');
const cors = require('cors');
require('dotenv').config();

const productsRouter = require('./routes/products');

const app = express();

//Middleware
//if off, a frontend must be on the same domain to access the backend
//if on, a frontend can access the backend from any domain
//cors is a middleware that allows cross-origin requests

app.use(express.json());
app.use(cors());


//routes
app.use('/api/products', productsRouter);

app.get('/', (req, res) => { 
    res.json({
        message: 'Welcome to my World'
    });
} )

 //start server
const PORT = process.env.PORT || 3000;

//when we do deployment, we need to set the port to 80 or 443
//or different hosting services might have different ports
//so we need to set the port to the environment variable
//so that we can use the port that is assigned by the hosting service

app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
});