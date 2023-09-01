const mongoose = require("mongoose");

const queriesSchema = new mongoose.Schema(
  {
    // user: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "userModel",
    //   required: true,
    // },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const queriesModel = mongoose.model("queriesModel", queriesSchema);
module.exports = queriesModel;
