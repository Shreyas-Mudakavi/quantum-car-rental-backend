const express = require('express');

const router = express.Router();
const {addCar,getCar, findCarDetails} = require('../Contoller/carController');
const {bookCar , getAvailableCar} = require('../Contoller/bookingController');



router.post('/add-car', addCar);
router.get('/get-car',getCar);
router.post('/book-car',bookCar);
router.post('/getAvail-car',getAvailableCar);
router.get('/find-car',findCarDetails);
module.exports = router;