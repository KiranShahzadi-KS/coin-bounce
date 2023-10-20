const express = require("express");
const { auth } = require("../middlewares/auth");
const {
  createBlog,
  getAllBlog,
  getById,
  updateBlog,
  deleteBlog,
} = require("../controller/blogController");
const { route } = require("./authRoute");
const router = express.Router();

//create
router.post("/", auth, createBlog);
//get all
router.get("/all", auth, getAllBlog);

//get blog by id
router.get("/:id", auth, getById);

//update
router.post("/update", auth, updateBlog);

//delete
router.delete("/delete/:id", auth, deleteBlog);

module.exports = router;
