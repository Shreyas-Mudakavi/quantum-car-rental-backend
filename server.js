const express = require("express");
const app = express();
// require('dotenv').config();
const connectDB = require("./config/db");
const cors = require("cors");
connectDB();
const Port = process.env.PORT || 5000;

app.use(express.json());
const userRouter = require("./Router/userRouter");
const carRoute = require("./Router/carRoute");
const bookingRoute = require("./Router/bookingRoute");
const bookingModel = require("./Model/Booking");
const adminRoute = require("./Router/adminRoute");
const locationRoutes = require("./Router/locationRoutes");
const queryRoutes = require("./Router/queryRoute");
// console.log(bookingModel);
app.use(cors());

app.use("/api/user", userRouter);
app.use("/api/location", locationRoutes);
app.use("/api/car", carRoute);
app.use("/api/booking", bookingRoute);
app.use("/api/query", queryRoutes);
app.use("/api/admin", adminRoute);

app.get("/", (req, res, next) => {
  res.status(200).json({ msg: "Car rental!!" });
});

app.listen(Port, () => {
  console.log(`server is listening on Port ${Port}`);
});
