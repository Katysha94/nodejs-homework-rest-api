const express = require("express");

const ContactController = require("../../controllers/contacts");

const router = express.Router();

router.get("/", ContactController.listContacts);

router.get("/:id", ContactController.getContactById);

router.post("/", ContactController.addContact);

router.delete("/:id", ContactController.removeContact);

router.put("/:id", ContactController.updateContact);

router.patch("/:id/favorite", ContactController.updateStatusContact);

module.exports = router;
