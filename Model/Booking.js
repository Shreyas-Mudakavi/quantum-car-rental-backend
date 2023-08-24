const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "carModel",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userModel",
      required: true,
    },
    pickupLocation: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    dropofLocation: {
      type: String,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    person: {
      type: String,
      required: true,
    },
    luggage: {
      type: String,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },
    hireAgreement: {
      type: String,
      enum: ["Pending", "Agreed"],
      default: "Pending",
    },
    paypalOrderId: {
      type: String,
    },
    insurance: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

const bookingModel = mongoose.model("bookingModel", BookingSchema);
module.exports = bookingModel;
