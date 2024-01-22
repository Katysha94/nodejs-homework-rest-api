const Contact = require("../models/contact");
const {
  contactSchema,
  updateSchema,
  updateFavoriteSchema,
} = require("../validation/contacts");
const HttpError = require("../helpers/HttpError");

async function listContacts(req, res, next) {
  const userId = req.user.id;
  const { page = 1, limit = 20, favorite } = req.query;
  const filter = { owner: userId };
  if (favorite) {
    filter.favorite = favorite === "true";
  }

  const skip = (page - 1) * limit;

  const contacts = await Contact.find(filter, "", { skip, limit });
  res.send(contacts);
}

async function getContactById(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({ message: "Not found" });
    }
    if (contact.owner.toString() !== userId) {
      return res.status(401).send({ message: "Not authorized" });
    }

    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
}

async function addContact(req, res, next) {
  try {
    const { error } = contactSchema.validate(req.body, { abortEarly: false });
    if (error) {
      res.status(400).json({ message: error.message });
    }
    const contact = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      favorite: req.body.favorite,
      owner: req.user.id,
    };
    const newContact = await Contact.create(contact);
    res.status(201).send(newContact);
  } catch (error) {
    next(error);
  }
}

async function updateContact(req, res, next) {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "missing fields" });
    }
    const { error } = updateSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const { id } = req.params;
    const contact = await Contact.findById(id);
    const userId = req.user.id;

    if (contact.owner.toString() !== userId) {
      return res.status(401).send({ message: "Not authorized" });
    }

    const updatedContact = await Contact.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedContact) {
      return res.status(404).json({ message: "Not found" });
    }
    res.send(updatedContact);
  } catch (error) {
    next(error);
  }
}

async function removeContact(req, res, next) {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id);
    const userId = req.user.id;

    if (contact.owner.toString() !== userId) {
      return res.status(401).send({ message: "Not authorized" });
    }

    const deletedContact = await Contact.findByIdAndDelete(id);
    if (!deletedContact) {
      return res.status(404).json({ message: "Not found" });
    } else {
      res.status(200).json({ message: "contact deleted" });
    }
  } catch (error) {
    next(error);
  }
}

async function updateStatusContact(req, res, next) {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "missing field favorite" });
    }
    const { error } = updateFavoriteSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const { id } = req.params;
    const { favorite } = req.body;
    const contact = await Contact.findById(id);
    const userId = req.user.id;

    if (contact.owner.toString() !== userId) {
      return res.status(401).send({ message: "Not authorized" });
    }

    const result = await Contact.findByIdAndUpdate(
      id,
      { favorite: favorite },
      { new: true }
    );
    if (!result) {
      return res.status(404).json({ message: "Not found" });
    }
    res.send(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getContactById,
  listContacts,
  addContact,
  updateContact,
  removeContact,
  updateStatusContact,
};
