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

router.get("/statistics/:time", getStatistics);

router.post("/login", adminLogin);
router.post("/car/add-car", addCar);
router.post("/image", upload.single("image"), postSingleImage);
router.get("/all-booking", findAllBooking);
router.get("/get-booking/:id", getBooking);
router.delete("/delete-booking/:id", deleteBooking);
router.get("/all-transaction", findAllTransaction);
router.get("/get-transaction/:id", transactionDetails);
router.delete("/delete-transaction/:id", deleteTransaction);

// route for location
router.post("/add-location", addLocation);
router.get("/all-location", getLocation);

router.get("/user/all", getAllUsers);
router.route("/user/:id").get(getUser).put(adminUpdateUser).delete(deleteUser);

router.get("/user-profile/:id", getProfile);

module.exports = router;
