const mongoose = require("mongoose");
require("dotenv").config();

// Define the MongoDB connection URL
const URI = process.env.MONGODB_URL; // Replace 'mydatabase' with your database nam

const connectDb = async () => {
  try {
    await mongoose.connect(URI);
    console.log("connection successful to database");
  } catch (error) {
    console.error("database connection failed", error);
    process.exit(0);
  }
};

module.exports = connectDb;
