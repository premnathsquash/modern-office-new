const mongoose = require("mongoose");

const Office = mongoose.model(
  "Office",
  new mongoose.Schema({
    slug: String,
    officeName: String,
    address: String,
    zipcode: String,
    city: String,
    state: String,
    country: String,
  })
);

module.exports = Office;
