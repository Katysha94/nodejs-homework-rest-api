const path = require("node:path");
const multer = require("multer");
const crypto = require("node:crypto");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "tmp"));
  },
  filename: (req, file, cb) => {
    const extname = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extname);
    const suffix = crypto.randomUUID();

    const filename = `${basename}-${suffix}${extname}`;
    const avatarURL = path.join("avatars", filename);

    cb(null, filename);
  },
});

module.exports = multer({ storage });
