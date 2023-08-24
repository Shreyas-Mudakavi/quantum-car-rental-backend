const express = require('express');
const router = express.Router();
const {adminLogin, getAllUsers,getUser,deleteUser,getProfile, postSingleImage} = require('../Contoller/adminController');

const {addCar} = require('../Contoller/carController');
const { upload } = require('../utils/s3');

router.post('/login',adminLogin);
router.post('/car/add-car',addCar)
router.post('/image',upload.single('image'), postSingleImage)

router.get('/user/all',getAllUsers);
router
  .route("/user/:id")
  .get( getUser)
  .delete(deleteUser);

  router.get("/user-profile",getProfile);

module.exports = router;