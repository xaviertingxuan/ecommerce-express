const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const userService = require('../services/userService');
const AuthenticateWithJWT = require('../middlewares/AuthenticateWithJWT');


router.post('/register', async (req, res) => {
    try {
        const result = await userService.registerUser(
            req.body.name,
            req.body.email,
            req.body.password,
            req.body.salutation,
            req.body.country,
            req.body.marketingPreferences
        );

        res.json({
            'message': 'User has been created successful',
            'result': result
        })

    } catch (e) {
        console.log(e);
        res.status(500).json({
            'message': 'Error registering a user'
        })
    }

})

router.post('/login', async (req, res) => {
    const user = await userService.loginUser(req.body.email, req.body.password);

    // the first parameter of jwt.sign is the payload or 'claims'
    // the second parameter is the JWT_SECRET
    // the third parameter is the options
    const token = jwt.sign({
        'userId': user.id
    }, process.env.JWT_SECRET, {
        expiresIn: '1h'
    })
    res.json({
        'message': 'Login successful!',
        'user': user,
        'token': token
    })
})

// user profile route: display the profile of the updated user
router.get('/me', AuthenticateWithJWT, async (req, res) => {
    const user = await userService.getUserDetailsById(req.userId);
    res.json(
        {
            'user': user
        }
    )
})

// user profile route: update the profile of the updated user
router.put('/me', AuthenticateWithJWT, (req, res) => {
    userService.updateUserDetails(req.userId, req.body);
    res.json(
        {
            'message': 'User profile updated'
        }
    )
})

router.delete('/:id', AuthenticateWithJWT, async (req, res) => {
    try {
        await userService.deleteUser(req.userId);
        res.json({
            'message': 'User has been deleted'
        })
    } catch (e) {
        console.log(e)
        res.json({
            'message': 'error deleteing user'
        })
    }


})

module.exports = router;