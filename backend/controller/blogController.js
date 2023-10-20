const Blog = require("../models/blog");
const Joi = require("joi");
const fs = require("fs");
// const { BACKEND_SERVER_PATH } = require("../config/dbConnection");
const BlogDTO = require("../dto/blog");
const { mongo } = require("mongoose");
const dotenv = require("dotenv").config();
const BlogDetailsDTO = require("../dto/blog-details");
const Comment = require("../models/comment");

const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;

exports.createBlog = async (req, res, next) => {
  //1. Validate req body
  //2. Handle photo
  //3. add to DB
  //4.  return response

  const createBlogSchema = Joi.object({
    title: Joi.string().required(),
    author: Joi.string().regex(mongodbIdPattern).required(),
    content: Joi.string().required(),
    // client side -> base64 encoded string -> decode -> store -> save photo's path in db
    photo: Joi.string().required(),
  });
  const { error } = createBlogSchema.validate(req.body);
  if (error) {
    return next(error);
  }
  const { title, author, content, photo } = req.body;

  //read as buffer
  const buffer = Buffer.from(
    photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),
    "base64"
  );

  //alot a random name
  const imagePath = `${Date.now()}-${author}.png`;

  //save locally
  try {
    //fs write file module
    fs.writeFileSync(`storage/${imagePath}`, buffer);
  } catch (error) {
    return next(error);
  }

  //save blog in database
  let newBlog;
  try {
    newBlog = new Blog({
      title,
      author,
      content,
      photoPath: `${process.env.BACKEND_SERVER_PATH}/storage/${imagePath}`,
    });
    await newBlog.save();
  } catch (error) {
    return next(error);
  }

  const blogDto = new BlogDTO(newBlog);
  return res.status(201).json({ blog: blogDto });
};

exports.getAllBlog = async (req, res, next) => {
  try {
    const blogs = await Blog.find({});
    const blogsDto = [];
    for (let i = 0; i < blogs.length; i++) {
      const dto = new BlogDTO(blogs[i]);
      blogsDto.push(dto);
    }
    return res.status(200).json({ blogs: blogsDto });
  } catch (error) {
    return next(error);
  }
};

exports.getById = async (req, res, next) => {
  //validate id
  //response send

  const getByIdSchema = Joi.object({
    id: Joi.string().regex(mongodbIdPattern).required(),
  });
  const { error } = getByIdSchema.validate(req.params);

  if (error) {
    return next(error);
  }

  let blog;
  let { id } = req.params;
  try {
    blog = await Blog.findOne({ _id: id }).populate("author");
  } catch (error) {
    return next(error);
  }

  const blogDto = new BlogDetailsDTO(blog);
  return res.status(200).json({ blog: blogDto });
};

exports.updateBlog = async (req, res, next) => {
  //validate request
  //

  const updataBlogSchema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    author: Joi.string().regex(mongodbIdPattern).required(),
    blogId: Joi.string().regex(mongodbIdPattern).required(),
    photo: Joi.string().required(),
  });
  const { error } = updataBlogSchema.validate(req.body);
  const { title, content, author, blogId, photo } = req.body;

  //delete previous photo
  //save new photo

  let blog;
  try {
    blog = await Blog.findOne({ _id: blogId });
  } catch (error) {
    return next(error);
  }
  if (photo) {
    let previousPhoto = blog.photoPath;
    previousPhoto = previousPhoto.split("/").at(-1);

    //delete photo
    fs.unlinkSync(`storage/${previousPhoto}`);

    //store new photo
    //read as buffer
    const buffer = Buffer.from(
      photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),
      "base64"
    );
    //alot a random name
    const imagePath = `${Date.now()}-${author}.png`;
    //save locally
    try {
      //fs write file module
      fs.writeFileSync(`storage/${imagePath}`, buffer);
    } catch (error) {
      return next(error);
    }
    await Blog.updateOne(
      { _id: blogId },
      {
        title,
        content,
        photoPath: `${process.env.BACKEND_SERVER_PATH}
      /storage/${imagePath}`,
      }
    );
  } else {
    await Blog.updateOne({ _id: blogId }, { title, content });
  }
  return res.status(200).json({ message: "blog updated!" });
};

exports.deleteBlog = async (req, res, next) => {
  //validate id
  //delete blog
  //delete comments on this blog

  const deleteBlogSchema = Joi.object({
    id: Joi.string().regex(mongodbIdPattern).required(),
  });
  const { error } = deleteBlogSchema.validate(req.params);

  const { id } = req.params;

  try {
    await Blog.deleteOne({ _id: id });

    //delete comment
    await Comment.deleteMany({ blog: id });
  } catch (error) {
    return next(error);
  }

  return res.status(200).json({ message: "Blog Deleted!" });
};
