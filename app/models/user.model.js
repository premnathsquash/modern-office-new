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
    officeConfigure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OfficeConfigure",
    },
    profile: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    }],
    departments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
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
    minSeat: Number,
    maxSeat: Number,
    active: {
      type: Boolean,
      default: true
    },
    trialEnd: String
  }, {strict: false, timestamps: true})
);

module.exports = User;
