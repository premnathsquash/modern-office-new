const mongoose = require("mongoose");

const Promotion = mongoose.model(
  "Promotion",
  new mongoose.Schema({
    productName: String,
    category: [String],
    pointNeeded: String,
    offer: String,
    validTill: Date,
    link: String,
  })
);

module.exports = Promotion;
