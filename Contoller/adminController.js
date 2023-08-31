const APIFeatures = require("../utils/apiFeatures");
const userModel = require("../Model/Users");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const bcrypt = require("bcrypt");
const { s3Uploadv2 } = require("../utils/s3");
const bookingModel = require("../Model/Booking");
const secretKey = process.env.SECRET_KEY;

const getAllUsers = async (req, res, next) => {
  console.log(req.query);
  const userCount = await userModel.countDocuments();
  console.log("userCount", userCount);

  const apiFeature = new APIFeatures(
    userModel.find().sort({ createdAt: -1 }),
    req.query
  ).search("name");

  let users = await apiFeature.query;
  console.log("users", users);
  let filteredUserCount = users.length;
  if (req.query.resultPerPage && req.query.currentPage) {
    apiFeature.pagination();

    console.log("filteredUserCount", filteredUserCount);
    users = await apiFeature.query.clone();
  }
  console.log("users", users);
  res.status(200).json({ users, userCount, filteredUserCount });
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
    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: "10h",
    });
    return res.status(200).json({
      user: user,
      token: token,
      message: "user login successfully",
    });
  } catch (error) {
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
  const { id } = req.params;
  const user = await userModel.findOneAndDelete({ _id: id });

  if (!user) {
    return next(new ErrorHandler("User Not found", 404));
  }

  await user.remove();

  res.status(200).json({
    message: "User Deleted Successfully.",
  });
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

const adminUpdateUser = async (req, res) => {
  // console.log('update user api is called');

  //  console.log(req.body);
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
    return res.status(200).json({
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
          amount: 1,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
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
          amount: 1,
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
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return res.send({
      users: users,
      payments: payments,
      bookings: bookings,
      dailyUsers,
      dailyBookings,
      dailyPayments,
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
              { $dateSubtract: { startDate: date, unit: "day", amount: 1 } },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
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
              { $dateSubtract: { startDate: date, unit: "day", amount: 6 } },
            ],
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.send({
      users: users,
      payments: payments,
      bookings: bookings,
      dailyUsers,
      dailyBookings,
      dailyPayments,
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
    const payments = await bookingModel.aggregate([
      {
        $project: {
          week: { $week: "$createdAt" },

          year: { $year: "$createdAt" },
          amount: 1,
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
          total: { $sum: "$amount" },
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
          amount: 1,
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
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return res.send({
      users: users,
      payments: payments,
      bookings: bookings,
      dailyUsers,
      dailyBookings,
      dailyPayments,
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
          amount: 1,
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
          total: { $sum: "$amount" },
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
          amount: 1,
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
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return res.send({
      users: users,
      payments: payments,
      bookings: bookings,
      dailyUsers,
      dailyBookings,
      dailyPayments,
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
};
