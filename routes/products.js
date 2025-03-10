const express = require('express')
const router = express.Router()

//get
router.get('/', (req, res) => {
    res.send('Get all products')
}) 

//get products by id

router.get('/:id', (req, res) => {
    res.send(`Get Product with id ${req.params.id}`)
});   

module.exports = router;