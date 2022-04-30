const mongoose = require("mongoose");

const Promotion = mongoose.model(
  "Promotion",
  new mongoose.Schema(
    {
      image: String,
      description: String,
      company: String,
      productName: String,
      pointsNeeded: String,
      coupon: String,
      offer: String,
      claimed: { type: Number, default: 0 },
      categories: [String],
      validTill: Date,
      link: String,
      companyClaimed: [
        {
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          profiles: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Profile",
            }
          ]
        },
      ],
    },
    {
      timestamps: true,
    }
  )
);

module.exports = Promotion;
