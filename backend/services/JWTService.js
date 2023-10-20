const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

// const {
//   ACCESS_TOKEN_SECRET,
//   REFRESH_TOKEN_SECRET,
// } = require("../config/dbConnection");

const token = require("../models/token");

class JWTService {
  //sign access token
  static signAccessToken(payload, expireTime) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: expireTime,
    });
  }

  //sign refresh token
  static signRefreshToken(payload, expireTime) {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: expireTime,
    });
  }

  //verify access token
  static verifyAccessToken(token) {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  }

  //verify refresh token
  static verifyRefreshToken(token) {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  }

  //store refresh token
  static async storeRefreshToken(token, userId) {
    try {
      const newToken = new RefreshToken({
        token: token,
        userId: userId,
      });
      //store in db
      await newToken.save();
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = JWTService;
