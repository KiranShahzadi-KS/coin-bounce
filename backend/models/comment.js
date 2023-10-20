const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    blog: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Blog",
    },
    author: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

//Export the model
module.exports = mongoose.model("Comment", commentSchema, "comments");
