const jwt = require("jsonwebtoken");
const User = require("../models/user");

async function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (typeof authHeader === "undefined") {
    return res.status(401).send({ message: "Not authorized" });
  }
  const [bearer, token] = authHeader.split(" ", 2);
  if (bearer !== "Bearer") {
    return res.status(401).send({ message: "Not authorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (error, decode) => {
    if (error) {
      return res.status(401).send({ message: "Not authorized" });
    }
    const user = await User.findById(decode.id);

    if (user === null || user.token !== token) {
      return res.status(401).send({ message: "Not authorized" });
    }

    req.user = { id: decode.id };

    next();
  });
}

module.exports = auth;
