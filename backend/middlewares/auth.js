const JWTService = require("../services/JWTService");
const User = require("../models/user");
const UserDTO = require("../dto/user");

exports.auth = async (req, res, next) => {
  try {
    // 1. Refresh, Access token validation
    const { refreshToken, accessToken } = req.cookies;

    if (!refreshToken || !accessToken) {
      const error = {
        status: 401,
        message: "Unauthorized",
      };
      return next(error);
    }

    let _id;
    try {
      // Corrected the access to _id in JWTService.verifyAccessToken
      _id = JWTService.verifyAccessToken(accessToken)._id;
    } catch (error) {
      return next(error);
    }

    let user;
    try {
      // Corrected the query to find the user by _id
      user = await User.findOne({ _id: _id });
    } catch (error) {
      return next(error);
    }

    const userDto = new UserDTO(user);

    // Set the authenticated user in the request object
    req.user = userDto;

    next();
  } catch (error) {
    return next(error);
  }
};
