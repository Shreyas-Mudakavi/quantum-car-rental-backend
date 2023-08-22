const express = require('express');
const router = express.Router();
const {adminLogin, getAllUsers,getUser,deleteUser,getProfile} = require('../Contoller/adminController');

router.post('/login',adminLogin);
router.get('/user/all',getAllUsers);
router
  .route("/user/:id")
  .get( getUser)
  .delete(deleteUser);

  router.get("/user-profile",getProfile);

module.exports = router;