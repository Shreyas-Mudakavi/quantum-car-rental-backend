const express = require("express");
const router = express.Router();
const {
  adminLogin,
  getAllUsers,
  getUser,
  deleteUser,
  getProfile,
  postSingleImage,
  adminUpdateUser,
  getStatistics,
  getAllCars,
  getAllBookings,
  deleteLocation,
} = require("../Contoller/adminController");
const {
  findAllBooking,
  getBooking,
  deleteBooking,
} = require("../Contoller/bookingController");

const { addCar } = require("../Contoller/carController");
const { upload } = require("../utils/s3");
const { addLocation, getLocation } = require("../Contoller/locationController");
const {
  findAllTransaction,
  transactionDetails,
  deleteTransaction,
} = require("../Contoller/transactionController");
const {
  getAllQueries,
  getQuery,
  deleteQuery,
} = require("../Contoller/queryController");

router.get("/statistics/:time", getStatistics);

router.post("/login", adminLogin);

router.post("/car/add-car", addCar);
router.get("/getAllCars", getAllCars);
router.post("/image", upload.single("image"), postSingleImage);

router.get("/all-booking", getAllBookings);
router.get("/get-booking/:id", getBooking);
router.delete("/delete-booking/:id", deleteBooking);

router.get("/all-transaction", findAllTransaction);
router.get("/get-transaction/:id", transactionDetails);
router.delete("/delete-transaction/:id", deleteTransaction);

// route for location
router.post("/add-location", addLocation);
router.get("/all-location", getLocation);
router.delete("/delete-location/:name", deleteLocation);

router.get("/user/all", getAllUsers);
router.route("/user/:id").get(getUser).put(adminUpdateUser).delete(deleteUser);
router.get("/user-profile/:id", getProfile);

router.get("/getAllQueries", getAllQueries);
router.get("/get-query/:id", getQuery);
router.delete("/delete-query/:id", deleteQuery);

module.exports = router;
