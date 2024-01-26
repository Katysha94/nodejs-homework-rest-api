const express = require("express");
const router = express.Router();

const AuthController = require("../../controllers/auth");
const validateBody = require("../../middlewares/validateBody");
const { userSchema, subscriptionSchema } = require("../../validation/auth");
const authMiddlewar = require("../../middlewares/auth");
const uploadMiddlewar = require("../../middlewares/upload");

router.post("/register", validateBody(userSchema), AuthController.register);
router.post("/login", validateBody(userSchema), AuthController.login);
router.post("/logout", authMiddlewar, AuthController.logout);
router.get("/current", authMiddlewar, AuthController.getCurrent);
router.patch(
  "/",
  authMiddlewar,
  validateBody(subscriptionSchema),
  AuthController.updateSubscription
);

router.patch(
  "/avatar",
  uploadMiddlewar.single("avatar"),
  authMiddlewar,
  AuthController.uploadAvatar
);

module.exports = router;
