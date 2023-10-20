const express = require("express");
const {
  registerUser,
  loginUser,
  logout,
  refresh,
} = require("../controller/authControllers");
const { auth } = require("../middlewares/auth");
const router = express.Router();

//register
router.post("/register", registerUser);
//login
router.post("/login", loginUser);
//logout
router.post("/logout", auth, logout);
//Refresh
router.get("/refresh", refresh);

module.exports = router;
