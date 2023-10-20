const express = require("express");
const { auth } = require("../middlewares/auth");
const { createComment, getById } = require("../controller/commentController");
const router = express.Router();

//create
router.post("/", auth, createComment);

//get by id
router.get("/:id", auth, getById);
module.exports = router;
