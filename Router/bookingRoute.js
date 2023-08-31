const express = require("express");
const {
  calculateFare,
  createBooking,
  capturePayment,
  bookingWebhook,
  getAllBookingHistory,
  acceptHireAgree,
  getBookingHistory,
  checkAvailability,
} = require("../Contoller/bookingController");
const auth = require("../Middleware/auth");

const router = express.Router();

router.post("/check-availability", auth, checkAvailability);
router.post("/calculate-total", auth, calculateFare);
router.post("/create-booking", auth, createBooking);
router.post("/capture-payment/:orderId", auth, capturePayment);
router.post("/webhook", bookingWebhook);
router.get("/getAll", auth, getAllBookingHistory);
router.post("/accept-hireAgree/:id", auth, acceptHireAgree);
router.get("/get-booking/:id", auth, getBookingHistory);

module.exports = router;
