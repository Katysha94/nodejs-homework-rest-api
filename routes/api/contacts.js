const express = require("express");
const contacts = require("../../models/contacts");
const router = express.Router();
const Joi = require("joi");
const { HttpError } = require("../../helpers");

const contactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
});

const updateSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string(),
  phone: Joi.string(),
});

router.get("/", async (req, res, next) => {
  try {
    const allContacts = await contacts.listContacts();
    res.status(200).json(allContacts);
  } catch (err) {
    next(err);
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const searchedContact = await contacts.getContactById(contactId);
    if (searchedContact) {
      res.status(200).json(searchedContact);
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { error } = contactSchema.validate(req.body, { abortEarly: false });
    const missingField = error.details[0].path[0];
    if (error) {
      throw HttpError(400, `missing required ${missingField} field`);
    }
    const newContact = await contacts.addContact(req.body);
    res.status(201).json(newContact);
  } catch (err) {
    next(err);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const deletedContact = await contacts.removeContact(contactId);
    if (!deletedContact) {
      throw HttpError(404, "Not found");
    } else {
      res.status(200).json({ message: "contact deleted" });
    }
  } catch (err) {
    next(err);
  }
});

router.put("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const existingContact = await contacts.getContactById(contactId);
    if (!existingContact) {
      throw HttpError(404, "Not found");
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      throw HttpError(400, "missing fields");
    }
    const { error } = updateSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const updatedContact = { ...existingContact, ...req.body };
    await contacts.updateContact(contactId, updatedContact);
    res.status(200).json(updatedContact);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
