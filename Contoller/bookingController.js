const bookingModel = require("../Model/Booking");
const { format } = require("date-fns");
const axios = require("axios");
const carModel = require("../Model/Cars");
const mongoose = require("mongoose");
const { generateAccessToken } = require("../utils/paypal-api");
const { calculateTotal } = require("../utils/calculateBookingTotal");
const transactionModel = require("../Model/Transaction");

const base = "https://api-m.sandbox.paypal.com";

const bookCar = async (req, res) => {
  const { carId, userId, startDate, endDate, startTime, endTime } = req.body;
  try {
    const startDateTime = new Date(startDate + "T" + startTime + "Z");
    const endDateTime = new Date(endDate + "T" + endTime + "Z");

    const booked_car = await bookingModel.find({
      car: carId,
      $or: [
        {
          $and: [
            { startDate: { $lt: startDateTime } },
            { endDate: { $gte: startDateTime } },
          ],
        },
        {
          $and: [
            { startDate: { $lt: endDateTime } },
            { endDate: { $gte: endDateTime } },
          ],
        },
        {
          $and: [
            { startDate: { $gt: startDateTime } },
            { endDate: { $lt: endDateTime } },
          ],
        },
      ],
    });

    console.log(booked_car);
    if (booked_car.length !== 0) {
      return res.status(400).json({
        message: "car is already booked",
      });
    }
    const booking = new bookingModel({
      car: carId,
      user: userId,
      startDate: startDateTime,
      endDate: endDateTime,
    });
    const new_car = await booking.save();
    return res.status(200).json({
      message: "car booked successfully",
      newCar: new_car,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occured while booking an car",
      error: error,
    });
  }
};

const getAvailableCar = async (req, res) => {
  const { startDate, endDate, fromAddress, toAddress, startTime, endTime } =
    req.body;
  console.log(req.body);
  try {
    const startDateTime = new Date(startDate + "T" + startTime + "Z");
    const endDateTime = new Date(endDate + "T" + endTime + "Z");

    const overlappingBookings = await bookingModel.find({
      $or: [
        {
          $and: [
            { startDate: { $lt: startDateTime } },
            { endDate: { $gte: startDateTime } },
          ],
        },
        {
          $and: [
            { startDate: { $lt: endDateTime } },
            { endDate: { $gte: endDateTime } },
          ],
        },
        {
          $and: [
            { startDate: { $gt: startDateTime } },
            { endDate: { $lt: endDateTime } },
          ],
        },
      ],
    });
    console.log(overlappingBookings);

    const bookedCarIds = overlappingBookings.map((booking) => booking.car);

    const availableCars = await carModel.find({
      _id: { $nin: bookedCarIds },
    });

    const unAvailableCar = await carModel.find({
      _id: { $in: bookedCarIds },
    });

    res.status(200).json({
      message: "Available cars fetched successfully",
      availableCars: availableCars,
      unAvailableCar: unAvailableCar,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occured while fetching non booked car",
      error: error,
    });
  }
};

const checkAvailability = async (req, res) => {
  const { startDate, endDate, startTime, endTime, carId } = req.body;
  // console.log(req.body);
  try {
    const startDateTime = new Date(startDate + "T" + startTime + "Z");
    const endDateTime = new Date(endDate + "T" + endTime + "Z");

    const overlappingBookings = await bookingModel.find({
      $or: [
        {
          $and: [
            { startDate: { $lt: startDateTime } },
            { endDate: { $gte: startDateTime } },
          ],
        },
        {
          $and: [
            { startDate: { $lt: endDateTime } },
            { endDate: { $gte: endDateTime } },
          ],
        },
        {
          $and: [
            { startDate: { $gt: startDateTime } },
            { endDate: { $lt: endDateTime } },
          ],
        },
      ],
    });

    const bookedCar = overlappingBookings.filter(
      (booking) => booking.car.toString() === carId
    );

    // console.log("not avaaa  ", bookedCar);
    if (bookedCar.length > 0) {
      return res.status(200).json({
        message: "Car is booked! Please try with different date and time.",
        success: false,
      });
    } else {
      return res.status(200).json({
        message: "Car is available!",
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occured while fetching non booked car",
      error: error,
    });
  }
};

const calculateFare = async (req, res) => {
  const {
    name,
    email,
    phone,
    no_of_person,
    luggage_info,
    startDate,
    endDate,
    startTime,
    endTime,
    carId,
    insurance,
  } = req.body;

  try {
    const car = await carModel.findById(carId);

    const price = car.price;

    const total = await calculateTotal(
      startDate,
      endDate,
      startTime,
      endTime,
      price,
      insurance
    );

    res.status(200).json({
      message: "total calculated successfully",
      total: total,
    });
  } catch (err) {
    res.status(500).json({
      message: "An error occured while calculating the fare",
      error: err,
    });
  }
};

const createBooking = async (req, res, next) => {
  const url = `${base}/v2/checkout/orders`;

  const {
    startDate,
    endDate,
    startTime,
    endTime,
    carId,
    insurance,
    fromAddress,
    toAddress,
    person,
    luggage,
  } = req.body;

  try {
    const car = await carModel.findById(carId);

    const price = car.price;

    const total = await calculateTotal(
      startDate,
      endDate,
      startTime,
      endTime,
      price,
      insurance
    );
    console.log("create bookinggggg ", total);

    const accessToken = await generateAccessToken();
    console.log("create bookinggggg ", accessToken);
    const { data } = await axios.post(
      url,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: total,
            },
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("create order ", data.id);

    res.status(201).json({ order: data });
  } catch (error) {
    console.log("create booking err ", error);
    res.status(500).json(error);
  }
};

const capturePayment = async (req, res, next) => {
  const {
    startDate,
    endDate,
    startTime,
    endTime,
    carId,
    insurance,
    fromAddress,
    toAddress,
    person,
    luggage,
  } = req.body;
  try {
    const car = await carModel.findById(carId);

    const price = car.price;

    const total = await calculateTotal(
      startDate,
      endDate,
      startTime,
      endTime,
      price,
      insurance
    );

    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${req.params.orderId}/capture`;

    const { data } = await axios.post(
      url,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // console.log(
    //   "payment capture... ",
    //   data.purchase_units[0].payments.captures[0].status
    // );
    console.log("payment capture... data", data.id);

    const booking = new bookingModel({
      car: carId,
      user: req.userId,
      pickupLocation: fromAddress,
      startDate: new Date(
        `${format(new Date(startDate), "MMMM dd, yyyy")}, ${startTime}`
      ),
      dropofLocation: toAddress,
      endDate: new Date(
        `${format(new Date(endDate), "MMMM dd, yyyy")}, ${endTime}`
      ),
      person: person,
      luggage: luggage,
      totalPrice: total,
      status: data.purchase_units[0].payments.captures[0].status,
      paypalOrderId: data.id,
      insurance: insurance,
    });

    const newBooking = await booking.save();

    // also add to transaction model
    const transaction = new transactionModel({
      booking: newBooking._id,
      user: req.userId,
      amount: total,
      status: data.purchase_units[0].payments.captures[0].status,
      transactionId: data.purchase_units[0].payments.captures[0].id,
    });
    const newTransaction = await transaction.save();
    console.log("transaction...", newTransaction);

    res
      .status(200)
      .json({ paymentCaptured: data.purchase_units[0].payments.captures[0] });
  } catch (error) {
    console.log("capture pay err", error);
    res.status(500).json(error.message);
  }
};

const bookingWebhook = async (req, res, next) => {
  console.log("webhook!!! ");

  //   if (req.body.event_type === "CHECKOUT.ORDER.APPROVED") {
  //     console.log("CHECKOUT.ORDER.APPROVED ", req.body.resource.id);
  //   }

  if (req.body.event_type === "PAYMENT.CAPTURE.COMPLETED") {
    console.log("webhook!!! data ", req.body);

    console.log("webhook!!! status.. ", req.body.resource.status); // update in db
    console.log(
      "webhook!!! id.. ",
      req.body.resource.supplementary_data.related_ids.order_id
    ); // update in db

    const booking = await bookingModel.findOne({
      paypalOrderId: req.body.resource.supplementary_data.related_ids.order_id,
    });

    const transaction = await transactionModel.findOne({
      booking: booking._id,
    });
    console.log("transaction update webhook...", transaction);

    booking.status = req.body.resource.status;
    await booking.save();

    transaction.status = req.body.resource.status;
    await transaction.save();
  }

  res.status(200).json({ msg: "ok!!" });
};

const getAllBookingHistory = async (req, res, next) => {
  try {
    const bookings = await bookingModel
      .find({ user: req.userId })
      .populate("user")
      .populate("car");

    if (!bookings) {
      return res.status(404).json({
        message: "No previous bookings found!",
      });
    }

    res.status(200).json({ bookings: bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBookingHistory = async (req, res, next) => {
  try {
    const booking = await bookingModel
      .findById(req.params.id)
      .populate("user")
      .populate("car");

    if (!booking) {
      return res.status(404).json({
        message: "No booking found!",
      });
    }

    res.status(200).json({ booking: booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const acceptHireAgree = async (req, res, next) => {
  try {
    const booking = await bookingModel.findByIdAndUpdate(
      req.params.id,
      {
        hireAgreement: "Agreed",
      },
      { new: true }
    );
    res.status(200).json({ booking: booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const findAllBooking = async (req, res) => {
  try {
    const bookings = await bookingModel
      .find({})
      .populate("user")
      .populate("car");
    return res.status(200).json({
      message: "here is all booking",
      bookings: bookings,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "An error occured while fetching the booking",
      error: err.messsage,
    });
  }
};

const getBooking = async (req, res) => {
  try {
    const id = req.params.id;

    // Await the promise returned by bookingModel.findById(id)
    const booking = await bookingModel
      .findById(id)
      .populate("user")
      .populate("car");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.status(200).json({
      message: "Booking fetched successfully",
      booking: booking,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred while fetching the booking",
      error: error.message,
    });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    // console.log('booking id', bookingId);

    const deletedBooking = await bookingModel.findByIdAndDelete(bookingId);

    if (!deleteBooking) {
      return res.status(404).json({
        message: "booking not found",
      });
    }

    return res.status(200).json({
      message: "booking deleted",
      booking: deletedBooking,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred while deleting the booking",
      error: error.message,
    });
  }
};

module.exports = {
  bookCar,
  getAvailableCar,
  calculateFare,
  createBooking,
  capturePayment,
  bookingWebhook,
  getAllBookingHistory,
  acceptHireAgree,
  getBookingHistory,
  findAllBooking,
  getBooking,
  deleteBooking,
  checkAvailability,
};
