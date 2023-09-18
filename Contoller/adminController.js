const APIFeatures = require("../utils/apiFeatures");
const userModel = require("../Model/Users");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const bcrypt = require("bcrypt");
const { s3Uploadv2, s3UploadMulti } = require("../utils/s3");
const bookingModel = require("../Model/Booking");
const carModel = require("../Model/Cars");
const locationModel = require("../Model/Location");
const transactionModel = require("../Model/Transaction");
const secretKey = process.env.SECRET_KEY;

const getAllUsers = async (req, res, next) => {
  try {
    const userCount = await userModel.countDocuments();
    console.log("userCount", userCount);

    const apiFeature = new APIFeatures(
      userModel.find().sort({ createdAt: -1 }),
      req.query
    ).search("name");

    let users = await apiFeature.query;
    let filteredUserCount = users.length;
    if (req.query.resultPerPage && req.query.currentPage) {
      apiFeature.pagination();

      console.log("filteredUserCount", filteredUserCount);
      users = await apiFeature.query.clone();
    }
    res.status(200).json({ users, userCount, filteredUserCount });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const adminLogin = async (req, res) => {
  console.log(req.body);

  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid credential",
      });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "password does not match",
      });
    }

    console.log("user", user);

    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: "10h",
    });
    return res.status(200).json({
      user: user,
      token: token,
      message: "user login successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occured while login",
      error: error.message,
    });
  }
};

const getUser = async (req, res) => {
  const { id } = req.params;
  console.log("get user", id);
  const user = await userModel.findById(id);

  if (!user) return next(new ErrorHandler("User not found.", 404));

  res.status(200).json({ user });
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);
    if (!user) {
      return next(new ErrorHandler("User Not found", 404));
    }

    await userModel.findByIdAndDelete(id);

    res.status(200).json({
      message: "User Deleted Successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getProfile = async (req, res, next) => {
  const userId = req.params.id;

  try {
    const user = await userModel.findById(userId);
    // console.log(user);
    if (!user) {
      return next(new ErrorHandler("User not found.", 400));
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occured while fetching user profile",
      error: error.message,
    });
  }
};

const postSingleImage = async (req, res, next) => {
  const file = req.file;
  // if (!file) return next(new ErrorHandler("Invalid Image", 401));

  const results = await s3Uploadv2(file);
  const location = results.Location && results.Location;
  return res.status(201).json({ data: { location } });
};

const postMultipleImages = async (req, res, next) => {
  const files = req.files;

  try {
    if (files) {
      const results = await s3UploadMulti(files);
      console.log(results);

      let location = [];
      results.filter((result) => {
        location.push(result.Location);
      });

      return res.status(201).json({ data: { location } });
    } else {
      return res.status(401).json({
        message: "Invalid Image",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "An error occured while adding images.",
      error: error.message,
    });
  }
};

const adminUpdateUser = async (req, res) => {
  // console.log('update user api is called');

  //  const userId = '64d4ab73fb26cd35fd481e79';
  try {
    const updatedUser = await userModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "user does not found",
      });
    }
    res.status(200).json({
      message: "user updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    // console.log(error);
    return res.status(500).json({
      message: "An occured while updating the user",
      error: error.message,
    });
  }
};

const getAllCars = async (req, res, next) => {
  try {
    const carCount = await carModel.countDocuments();

    const apiFeature = new APIFeatures(
      carModel.find().sort({ createdAt: -1 }),
      req.query
    ).search("name");

    let cars = await apiFeature.query;
    let filteredCarCount = cars.length;
    if (req.query.resultPerPage && req.query.currentPage) {
      apiFeature.pagination();

      cars = await apiFeature.query.clone();
    }
    res.status(200).json({ cars, carCount, filteredCarCount });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const getAllBookings = async (req, res, next) => {
  try {
    let query = {};

    if (req.query.status !== "all") query.status = req.query.status;
    if (req.query.hireAgreement !== "all")
      query.hireAgreement = req.query.hireAgreement;

    const bookingCount = await bookingModel.countDocuments();
    console.log(query);

    const apiFeature = new APIFeatures(
      bookingModel
        .find(query)
        .sort({ createdAt: -1 })
        .populate("user")
        .populate("car"),
      req.query
    );
    // ).search("name");

    let bookings = await apiFeature.query;
    let filteredBookingCount = bookings.length;
    if (req.query.resultPerPage && req.query.currentPage) {
      apiFeature.pagination();

      bookings = await apiFeature.query.clone();
    }
    res.status(200).json({ bookings, bookingCount, filteredBookingCount });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const deleteLocation = async (req, res, next) => {
  const locationType = req.query.type;

  try {
    const location = await locationModel.findOne();

    if (locationType === "pickup") {
      await locationModel.updateMany({
        $pull: {
          pickupLocations: req.params.name,
        },
      });
    } else {
      await locationModel.updateMany({
        $pull: {
          dropOffLocations: req.params.name,
        },
      });
    }

    res.status(200).json({ message: "Deleted location!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const getStatistics = async (req, res, next) => {
  const { time } = req.params;
  const date = new Date();
  date.setHours(24, 0, 0, 0);
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  let startDate = new Date(date.getFullYear(), 0, 1);
  var days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
  var week = Math.ceil(days / 7);

  if (time == "all") {
    const users = await userModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);

    const transactions = await transactionModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);

    const bookings = await bookingModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);
    const payments = await bookingModel.aggregate([
      {
        $project: {
          totalPrice: 1,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" },
        },
      },
    ]);

    const dailyUsers = await userModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dailyTransactions = await transactionModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dailyBookings = await bookingModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dailyPayments = await bookingModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
          totalPrice: 1,
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.send({
      users: users,
      transactions: transactions,
      payments: payments,
      bookings: bookings,
      dailyUsers,
      dailyBookings,
      dailyPayments,
      dailyTransactions,
    });
  }
  if (time == "daily") {
    const users = await userModel.aggregate([
      {
        $match: {
          $expr: {
            $gt: [
              "$createdAt",
              { $dateSubtract: { startDate: date, unit: "day", amount: 1 } },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);
    const transactions = await transactionModel.aggregate([
      {
        $match: {
          $expr: {
            $gt: [
              "$createdAt",
              { $dateSubtract: { startDate: date, unit: "day", amount: 1 } },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);
    const bookings = await bookingModel.aggregate([
      {
        $match: {
          $expr: {
            $gt: [
              "$createdAt",
              { $dateSubtract: { startDate: date, unit: "day", amount: 1 } },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);
    const payments = await bookingModel.aggregate([
      {
        $match: {
          $expr: {
            $gt: [
              "$createdAt",
              {
                $dateSubtract: { startDate: date, unit: "day", totalPrice: 1 },
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" },
        },
      },
    ]);

    const dailyUsers = await userModel.aggregate([
      {
        $match: {
          $expr: {
            $gt: [
              "$createdAt",
              { $dateSubtract: { startDate: date, unit: "day", amount: 6 } },
            ],
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dailyTransactions = await transactionModel.aggregate([
      {
        $match: {
          $expr: {
            $gt: [
              "$createdAt",
              { $dateSubtract: { startDate: date, unit: "day", amount: 6 } },
            ],
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dailyBookings = await bookingModel.aggregate([
      {
        $match: {
          $expr: {
            $gt: [
              "$createdAt",
              { $dateSubtract: { startDate: date, unit: "day", amount: 6 } },
            ],
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dailyPayments = await bookingModel.aggregate([
      {
        $match: {
          $expr: {
            $gt: [
              "$createdAt",
              {
                $dateSubtract: { startDate: date, unit: "day", totalPrice: 6 },
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.send({
      users: users,
      transactions: transactions,
      payments: payments,
      bookings: bookings,
      dailyUsers,
      dailyBookings,
      dailyPayments,
      dailyTransactions,
    });
  }
  if (time == "weekly") {
    const users = await userModel.aggregate([
      {
        $project: {
          week: { $week: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
          week: week,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);
    const transactions = await transactionModel.aggregate([
      {
        $project: {
          week: { $week: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
          week: week,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);
    const payments = await bookingModel.aggregate([
      {
        $project: {
          week: { $week: "$createdAt" },

          year: { $year: "$createdAt" },
          totalPrice: 1,
        },
      },
      {
        $match: {
          year: year,
          week: week,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" },
        },
      },
    ]);
    const bookings = await bookingModel.aggregate([
      {
        $project: {
          week: { $week: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
          week: week,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);

    const dailyUsers = await userModel.aggregate([
      {
        $project: {
          week: { $week: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$week",
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dailyTransactions = await transactionModel.aggregate([
      {
        $project: {
          week: { $week: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$week",
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dailyBookings = await bookingModel.aggregate([
      {
        $project: {
          week: { $week: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$week",
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dailyPayments = await bookingModel.aggregate([
      {
        $project: {
          week: { $week: "$createdAt" },

          year: { $year: "$createdAt" },
          totalPrice: 1,
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$week",
          total: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return res.send({
      users: users,
      transactions: transactions,
      payments: payments,
      bookings: bookings,
      dailyUsers,
      dailyBookings,
      dailyPayments,
      dailyTransactions,
    });
  }
  if (time == "monthly") {
    const users = await userModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
          month: month,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);
    const transactions = await transactionModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
          month: month,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);
    const bookings = await bookingModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
          month: month,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]);
    const payments = await bookingModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
          totalPrice: 1,
        },
      },
      {
        $match: {
          year: year,
          month: month,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" },
        },
      },
    ]);

    const dailyUsers = await userModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dailyTransactions = await transactionModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dailyBookings = await bookingModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dailyPayments = await bookingModel.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },

          year: { $year: "$createdAt" },
          totalPrice: 1,
        },
      },
      {
        $match: {
          year: year,
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return res.send({
      users: users,
      transactions: transactions,
      payments: payments,
      bookings: bookings,
      dailyUsers,
      dailyBookings,
      dailyPayments,
      dailyTransactions,
    });
  }
};

module.exports = {
  getAllUsers,
  adminLogin,
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
};
