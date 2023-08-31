const express = require('express');
const router = express.Router();
const {adminLogin, getAllUsers,getUser,deleteUser,getProfile, postSingleImage} = require('../Contoller/adminController');
const {findAllBooking, getBooking, deleteBooking} = require('../Contoller/bookingController');

const {addCar} = require('../Contoller/carController');
const { upload } = require('../utils/s3');
const {addLocation , getLocation} = require('../Contoller/locationController');
const {findAllTransaction, transactionDetails} = require('../Contoller/transactionController');

router.post('/login',adminLogin);
router.post('/car/add-car',addCar)
router.post('/image',upload.single('image'), postSingleImage);
router.get('/all-booking',findAllBooking);
router.get('/get-booking/:id',getBooking);
router.delete('/delete-booking/:id',deleteBooking);
router.get('/all-transaction',findAllTransaction);
router.get('/get-transaction/:id',transactionDetails)

// route for location
router.post('/add-location',addLocation);
router.get('/all-location',getLocation)

router.get('/user/all',getAllUsers);
router
  .route("/user/:id")
  .get( getUser)
  .delete(deleteUser);

  router.get("/user-profile/:id",getProfile);

module.exports = router;