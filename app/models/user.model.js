const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    dp: String,
    email: String,
    password: String,
    job: String,
    roles: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    profile: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    }],
    phone: String,
    company: {
      name: String,
      companyImg: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      zip: String,
      country: String,
      website: String,
    },
    stripeProductPrice: {
      productId: String,
      priceId: String,
    },
    slug: String,
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    active: {
      type: Boolean,
      default: true
    },
    trialEnd: String
  })
);

module.exports = User;
