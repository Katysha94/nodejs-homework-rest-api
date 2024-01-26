const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const HttpError = require("../helpers/HttpError");
const User = require("../models/user");
const fs = require("node:fs/promises");
const path = require("node:path");
const gravatar = require("gravatar");
const jimp = require("jimp");

async function register(req, res, next) {
  const { email, password } = req.body;
  try {
    const users = await User.findOne({ email });
    if (users !== null) {
      throw HttpError(409, "Email in use!");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const avatarURL = gravatar.url(email, { protocol: "http" });

    const newUser = await User.create({
      ...req.body,
      password: passwordHash,
      avatarURL,
    });
    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw HttpError(401, "Email or password is wrong!");
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch === false) {
      throw HttpError(401, "Email or password is wrong!");
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1 day",
    });

    await User.findByIdAndUpdate(user._id, { token });

    res.status(200).json({
      token: token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).send({ message: "Not authorized" });
    }

    await User.findByIdAndUpdate(req.user.id, { token: null });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

async function getCurrent(req, res, next) {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).send({ message: "Not authorized" });
    }
    const userData = {
      email: user.email,
      subscription: user.subscription,
    };
    res.status(200).json(userData);
  } catch (error) {
    next(error);
  }
}

async function updateSubscription(req, res, next) {
  try {
    const userId = req.user.id;
    const { subscription } = req.body;

    const subscriptionType = ["starter", "pro", "business"];
    if (!subscriptionType.includes(subscription)) {
      return res.status(400).json({ message: "Invalid subscription value" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { subscription },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
}

async function uploadAvatar(req, res, next) {
  const userId = req.user.id;
  const avatarURL = req.file.filename;
  try {
    const sourcePath = req.file.path;
    const destinationPath = path.join(
      __dirname,
      "..",
      "public/avatars",
      req.file.filename
    );
    await fs.rename(sourcePath, destinationPath);

    const avatar = await jimp.read(destinationPath);
    avatar.resize(250, 250);
    await avatar.write(destinationPath);

    const user = await User.findByIdAndUpdate(
      userId,
      { avatarURL: destinationPath },
      { new: true }
    );
    if (!user) {
      throw HttpError(401, "Not authorized");
    }
    res.status(200).json({ avatarURL: destinationPath });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  logout,
  getCurrent,
  updateSubscription,
  uploadAvatar,
};
