const mongoose = require("mongoose");

const Promotion = mongoose.model(
  "Promotion",
  new mongoose.Schema({
    image: String,
    description: String,
    company: String,
    coupon: String,
    offer: String,
    claimed: String,
    categories: [String],
    validTill: Date,
    link: String,
  },
  {
    timestamps: true
  })
);

module.exports = Promotion;
