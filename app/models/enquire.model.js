const mongoose = require("mongoose");

const Enquire = mongoose.model(
  "Enquire",
  new mongoose.Schema({
    companyName: String,
    name: String,
    phone: String,
    email: String,
    query: String,
    customerType: String,
    status: {
      type: String,
      default: "Pending"
    },
    created: { type : Date, default: Date.now }
  })
);

module.exports = Enquire;
