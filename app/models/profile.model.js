const mongoose = require("mongoose");

const Profile = mongoose.model(
  "Profile",
  new mongoose.Schema({
    firstName: String,
    lastName: String,
    dp: String,
    pssword: String,
    slug: String,
    email: String,
    department: String,
    allocatedDesk: String,
    reservedSeats: {
      type: Boolean,
      default: false
    },
    makeAdmin: {
      type: Boolean,
      default: false
    },
    userGroup:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: Boolean,
      default: true
    },
    roles: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    attendance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attendance",
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },
  })
);

module.exports = Profile;
