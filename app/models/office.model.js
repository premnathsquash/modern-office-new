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
    floors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Floor",
    }]
  },
  {
    timestamps: true
  })
);


module.exports = Office;
