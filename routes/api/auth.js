const express = require("express");
const router = express.Router();

const AuthController = require("../../controllers/auth");
const validateBody = require("../../middlewares/validateBody");
const { userSchema } = require("../../validation/auth");
const authMiddlewar = require("../../middlewares/auth");

router.post("/register", validateBody(userSchema), AuthController.register);
router.post("/login", validateBody(userSchema), AuthController.login);
module.exports = router;
router.get("/logout", authMiddlewar, AuthController.logout);
router.get("/current", authMiddlewar, AuthController.getCurrent);
