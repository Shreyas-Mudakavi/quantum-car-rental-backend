const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "bookingModel",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userModel",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "PENDING",
    },
    transactionId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const transactionModel = mongoose.model("transactionModel", TransactionSchema);
module.exports = transactionModel;
