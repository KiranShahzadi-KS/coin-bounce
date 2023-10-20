const express = require("express");
const connectDB = require("./config/dbConnection");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const PORT = require("./config/dbConnection");

const authRouter = require("./routes/authRoute");
const blogRouter = require("./routes/blogRoute");
const commentRouter = require("./routes/commentRouter");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { errorHandler } = require("./middlewares/errorHandler");

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

connectDB();

app.use("/storage", express.static("storage"));

//Routes Connection
app.use("/api/user", authRouter);
app.use("/api/blog", blogRouter);
app.use("/api/comment", commentRouter);

app.use(errorHandler);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running at PORT ${port}`);
});
