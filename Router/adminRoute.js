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
  postMultipleImages,
} = require("../Contoller/adminController");
const {
  findAllBooking,
  getBooking,
  deleteBooking,
} = require("../Contoller/bookingController");

const {
  addCar,
  findCarDetails,
  updateCar,
} = require("../Contoller/carController");
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
const { auth, isAdmin } = require("../Middleware/auth");

router.get("/statistics/:time", auth, isAdmin, getStatistics);

router.post("/login", adminLogin);

router.post("/car/add-car", auth, isAdmin, addCar);
router.get("/getAllCars", auth, isAdmin, getAllCars);
router.get("/findCar/:id", auth, isAdmin, findCarDetails);
router.put("/updateCar/:id", auth, isAdmin, updateCar);

router.post("/image", upload.single("image"), postSingleImage);
router.post("/multi-image", upload.array("image"), postMultipleImages);

router.get("/all-booking", auth, isAdmin, getAllBookings);
router.get("/get-booking/:id", auth, isAdmin, getBooking);
router.delete("/delete-booking/:id", auth, isAdmin, deleteBooking);

router.get("/all-transaction", findAllTransaction);
router.get("/get-transaction/:id", transactionDetails);
router.delete("/delete-transaction/:id", deleteTransaction);

// route for location
router.post("/add-location", auth, isAdmin, addLocation);
router.get("/all-location", auth, isAdmin, getLocation);
router.delete("/delete-location/:name", auth, isAdmin, deleteLocation);

router.get("/user/all", auth, isAdmin, getAllUsers);
router.route("/user/:id").get(getUser).put(adminUpdateUser).delete(deleteUser);
router.get("/user-profile/:id", auth, isAdmin, getProfile);

router.get("/getAllQueries", auth, isAdmin, getAllQueries);
router.get("/get-query/:id", auth, isAdmin, getQuery);
router.delete("/delete-query/:id", auth, isAdmin, deleteQuery);

module.exports = router;
