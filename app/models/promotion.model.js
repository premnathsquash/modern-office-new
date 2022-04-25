const mongoose = require("mongoose");

const Promotion = mongoose.model(
  "Promotion",
  new mongoose.Schema(
    {
      image: String,
      description: String,
      company: String,
      coupon: String,
      offer: String,
      claimed: { type: Number, default: 0 },
      categories: [String],
      validTill: Date,
      link: String,
    },
    {
      timestamps: true,
    }
  )
);

module.exports = Promotion;
