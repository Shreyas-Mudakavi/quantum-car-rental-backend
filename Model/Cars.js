const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    details: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    images: {
      type: Array,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    noOfSeat: {
      type: Number,
      required: true,
    },
    speed: {
      type: String,
      required: true,
    },
    gps: {
      type: String,
      required: true,
    },
    automatic: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    features: {
      type: Array,
      required: true,
    },

    benefits: {
      type: Array,
      required: true,
    },

    // features: [
    //   {
    //     name: {
    //       type: String,
    //       required: true,
    //     },
    //     description: {
    //       type: String,
    //       required: true,
    //     },
    //   },
    // ],
  },
  { timestamps: true }
);

const carModel = mongoose.model("carModel", carSchema);
module.exports = carModel;
