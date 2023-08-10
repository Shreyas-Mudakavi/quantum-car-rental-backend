const express = require('express');
const router = express.Router();
const {registerUser, loginUser, findUser, updateUser} = require('../Contoller/userController');
const auth = require('../Middleware/auth');

router.post('/register',registerUser);
router.post('/login',loginUser);
router.get('/find-user',auth,findUser);
router.patch('/update-user',auth,updateUser);



module.exports = router