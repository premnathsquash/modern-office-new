const mongoose = require("mongoose");

const Enquire = mongoose.model(
  "Enquire",
  new mongoose.Schema({
    companyName: String,
    name: String,
    phone: String,
    email: String,
    query: String,
  })
);

module.exports = Enquire;
