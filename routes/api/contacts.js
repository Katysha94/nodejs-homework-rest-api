const express = require("express");

const ContactController = require("../../controllers/contacts");
const isValidId = require("../../middlewares/isValidId");

const router = express.Router();

router.get("/", ContactController.listContacts);

router.get("/:id", isValidId, ContactController.getContactById);

router.post("/", ContactController.addContact);

router.delete("/:id", isValidId, ContactController.removeContact);

router.put("/:id", isValidId, ContactController.updateContact);

router.patch("/:id/favorite", isValidId, ContactController.updateStatusContact);

module.exports = router;
