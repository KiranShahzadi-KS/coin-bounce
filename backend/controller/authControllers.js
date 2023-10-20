const User = require("../models/user");
const Joi = require("joi"); // Joi package for data validation
const bcrypt = require("bcryptjs");
const UserDTO = require("../dto/user");
const JWTService = require("../services/JWTService");
const RefreshToken = require("../models/token");

exports.registerUser = async (req, res, next) => {
  // Validate user input
  const userRegisterSchema = Joi.object({
    username: Joi.string().min(5).max(30).required(),
    name: Joi.string().max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    confirmPassword: Joi.ref("password"),
  });
  const { error } = userRegisterSchema.validate(req.body);

  if (error) {
    return next(error);
  }

  const { name, username, email, password } = req.body;

  try {
    // Check if email or username is already registered
    const emailInUse = await User.exists({ email });
    const usernameInUse = await User.exists({ username });

    if (emailInUse) {
      const error = {
        status: 409,
        message: "Email already registered, please use another email.",
      };
      return next(error);
    }

    if (usernameInUse) {
      const error = {
        status: 409,
        message: "Username not available.",
      };
      return next(error);
    }
  } catch (error) {
    return next(error);
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Store user data in the database
  let accessToken;
  let refreshToken;
  let user;

  try {
    const userToRegister = new User({
      username,
      email,
      name,
      password: hashedPassword,
    });
    user = await userToRegister.save();

    // Token generation
    accessToken = JWTService.signAccessToken({ _id: user._id }, "30m");
    refreshToken = JWTService.signRefreshToken({ _id: user.id }, "60m");
  } catch (error) {
    return next(error);
  }

  // Store the refresh token in the database
  await JWTService.storeRefreshToken(refreshToken, user._id);

  // Send tokens in cookies
  res.cookie("accessToken", accessToken, {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
  });

  // Refresh token
  res.cookie("refreshToken", refreshToken, {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
  });

  // Response
  const userDto = new UserDTO(user);
  return res.status(201).json({ user: userDto, auth: true });
};

exports.loginUser = async (req, res, next) => {
  // Validate user input
  const userLoginSchema = Joi.object({
    username: Joi.string().min(5).max(30).required(),
    password: Joi.string(),
  });
  const { error } = userLoginSchema.validate(req.body);

  if (error) {
    return next(error);
  }

  const { username, password } = req.body;

  let user;
  try {
    // Match username
    user = await User.findOne({ username: username });
    if (!user) {
      const error = {
        status: 402,
        message: "Invalid username.",
      };
      return next(error);
    }

    // Match password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      const error = {
        status: 401,
        message: "Invalid password.",
      };
      return next(error);
    }
  } catch (error) {
    return next(error);
  }

  const accessToken = JWTService.signAccessToken({ _id: user._id }, "30m");
  const refreshToken = JWTService.signRefreshToken({ _id: user._id }, "60m");

  // Update the refresh token in the database
  try {
    await RefreshToken.updateOne(
      {
        _id: user._id,
      },
      { token: refreshToken },
      { upsert: true }
    );
  } catch (error) {
    return next(error);
  }

  // Send tokens in cookies
  res.cookie("accessToken", accessToken, {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
  });

  res.cookie("refreshToken", refreshToken, {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
  });

  const userDto = new UserDTO(user);

  // Return response
  return res.status(200).json({ user: userDto, auth: true });
};

exports.logout = async (req, res, next) => {
  // Delete the refresh token from the database
  const { refreshToken } = req.cookies;
  try {
    await RefreshToken.deleteOne({ token: refreshToken });
  } catch (error) {
    return next(error);
  }

  // Delete cookies
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  // Send a response
  res.status(200).json({ user: null, auth: false });
};

exports.refresh = async (req, res, next) => {
  //1.Get refresh token from cookies

  const originalRefreshToken = req.cookies.refreshToken;

  let id;
  try {
    id = JWTService.verifyRefreshToken(originalRefreshToken)._id;
  } catch (e) {
    const error = {
      status: 401,
      message: "Unauthorized",
    };
    return next(error);
  }

  //2.verify  refresh token
  try {
    const match = RefreshToken.findOne({
      _id: id,
      token: originalRefreshToken,
    });
    if (!match) {
      const error = {
        status: 401,
        message: "Unauthorized",
      };
      return next(error);
    }
  } catch (e) {
    return next(e);
  }

  //3.Generate new tokens
  //4.update DB, return response
  try {
    const accessToken = JWTService.signAccessToken({ _id: id }, "30m");
    const refreshToken = JWTService.signRefreshToken({ _id: id }, "60m");

    await RefreshToken.updateOne({ _id: id }, { token: refreshToken });

    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });
  } catch (e) {
    return next(e);
  }

  const user = await User.findOne({ _id: id });

  const userDto = new UserDTO(user);

  return res.status(200).json({ user: userDto, auth: true });
};
