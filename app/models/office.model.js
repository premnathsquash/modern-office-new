const mongoose = require("mongoose");

const Office = mongoose.model(
  "Office",
  new mongoose.Schema({
    slug: String,
    officeName: String,
  })
);

module.exports = Office;
