const mongoose = require("mongoose");

const Vendor = mongoose.model(
  "Vendor",
  new mongoose.Schema(
    {
      companyName: String,
      companyImage: String,
      companyDescription: String,
      companyCategories: [String],
      contactName: String,
      contactImage: String,
      contactNumber: String,
      contactEmail: String,
      promotionIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Promotion",
        },
      ],
    },
    {
      timestamps: true,
    }
  )
);

module.exports = Vendor;
