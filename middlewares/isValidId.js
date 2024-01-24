const { isValidObjectId } = require("mongoose");
const HttpError = require("../helpers/HttpError");

const isValiId = (req, res, next) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw HttpError(400, `${id} is not valid id`);
  }
  next();
};

module.exports = isValiId;
