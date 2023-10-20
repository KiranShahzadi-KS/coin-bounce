const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

// exports.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
// exports.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
// exports.BACKEND_SERVER_PATH = process.env.BACKEND_SERVER_PATH;

// Connect to MongoDB
const connectDB = async () => {
  try {
    const connection = await mongoose.connect(
      process.env.MONGO_URL_LOCAL
      //   "mongodb+srv://kiran:kiran@cluster0.ng0e6n1.mongodb.net/dbname", // Online DB Access
      //   "mongodb://127.0.0.1:27017", // Work WIth Offline but acccess with  online DB (mongod)
      //   {
      //     useNewUrlParser: true,
      //     useUnifiedTopology: true,
      //   }
    );

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB: " + error.message);
  }
};

module.exports = connectDB;
