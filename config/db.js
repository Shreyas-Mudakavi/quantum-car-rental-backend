const mongoose = require("mongoose");
const dotenv = require("dotenv").config("");
const uri = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);
    const conn = await mongoose.connect(uri);
    console.log(`database is conected successfully`);
  } catch (error) {
    console.log(`An error occured while connecting to database ${error}`);
  }
};

module.exports = connectDB;
