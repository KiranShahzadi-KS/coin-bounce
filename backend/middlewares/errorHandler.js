const { ValidationError } = require("joi");

exports.errorHandler = (error, req, res, next) => {
  //defult error
  let status = 500;
  let data = {
    message: "Internal Server Error",
  };

  if (error instanceof ValidationError) {
    status = 401;
    data.message = error.message;

    return res.status(status).json(data);
  }
  if (error.status) {
    status = error.status;
  }
  if (error.message) {
    data.message = error.message;
  }
  return res.status(status).json(data);
};
