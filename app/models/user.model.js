const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
      }
    ],
    phone: String,
    company: {
      name: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      zip: String,
      country: String,
      website: String,
    },
    stripeProductPrice:{
      productId: String,
      priceId: String,
    },
    stripeCustomerId: String,
  })
);

module.exports = User;
