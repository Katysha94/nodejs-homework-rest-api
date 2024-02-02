const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const HttpError = require("../helpers/HttpError");
const User = require("../models/user");
const fs = require("node:fs/promises");
const path = require("node:path");
const gravatar = require("gravatar");
const jimp = require("jimp");
const { nanoid } = require("nanoid");

const sendEmail = require("../helpers/sendEmail");
const { BASE_URL } = process.env;

async function register(req, res, next) {
  const { email, password } = req.body;
  try {
    const users = await User.findOne({ email });
    if (users !== null) {
      throw HttpError(409, "Email in use!");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const avatarURL = gravatar.url(email, { protocol: "http" });

    const verificationToken = nanoid();

    await sendEmail({
      to: email,
      from: "vasilevakata76@gmail.com",
      subject: "Verify email",
      html: `To confirm your registration please click on the <a href="${BASE_URL}/api/users/verify/${verificationToken}">link</a>`,
      text: `To confirm your registration please click on the <a href="${BASE_URL}/api/users/verify/${verificationToken}">link</a>`,
    });

    const newUser = await User.create({
      ...req.body,
      verificationToken,
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

async function verifyEmail(req, res, next) {
  const { verificationToken } = req.params;

  try {
    const user = await User.findOne({ verificationToken });
    if (!user) {
      throw HttpError(404, "User not found");
    }

    await User.findByIdAndUpdate(user._id, {
      verify: true,
      verificationToken: null,
    });

    res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
  res.end();
}

async function resendVerifyEmail(req, res, next) {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw HttpError(404, "User not found");
    }
    if (user.verify) {
      throw HttpError(400, "Verification has already been passed!");
    }

    await sendEmail({
      to: email,
      from: "vasilevakata76@gmail.com",
      subject: "Verify email",
      html: `To confirm your registration please click on the <a href="${BASE_URL}/api/users/verify/${user.verificationToken}">link</a>`,
      text: `To confirm your registration please click on the <a href="${BASE_URL}/api/users/verify/${user.verificationToken}">link</a>`,
    });

    res.status(200).json({ message: "Verification email sent" });
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

    if (!user.verify) {
      throw HttpError(401, "Your email is not verifeid");
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

  if (!req.file) {
    return res.status(400).json({ error: "Missing avatar field!" });
  }

  try {
    const sourcePath = req.file.path;
    const filename = `${userId}_${req.file.originalname}`;
    const destinationPath = path.join(
      __dirname,
      "..",
      "public",
      "avatars",
      filename
    );
    await fs.rename(sourcePath, destinationPath);

    const avatar = await jimp.read(destinationPath);
    avatar.resize(250, 250);
    await avatar.write(destinationPath);

    const avatarURL = path.join("/avatars", filename);

    const user = await User.findByIdAndUpdate(
      userId,
      { avatarURL },
      { new: true }
    );
    if (!user) {
      throw HttpError(401, "Not authorized");
    }

    res.status(200).json({ avatarURL });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  verifyEmail,
  resendVerifyEmail,
  login,
  logout,
  getCurrent,
  updateSubscription,
  uploadAvatar,
};
