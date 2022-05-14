const mongoose = require("mongoose");

const Profile = mongoose.model(
  "Profile",
  new mongoose.Schema({
    firstName: String,
    lastName: String,
    dp: String,
    password: String,
    slug: String,
    email: String,
    department: String,
    reservation: {
      allocatedDesk: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seats",
      },
      floor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Floor",
      },
      seatName: String,
      booking: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Booking",
        }
      ]
    },
    reservedSeats: {
      type: Boolean,
      default: false,
    },
    makeAdmin: {
      type: Boolean,
      default: false,
    },
    userGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: Boolean,
      default: true,
    },
    roles: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    attendance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attendance",
    },
    reedemInfo: [
      {
        vendorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Vendor",
        },
        promotionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Promotion",
        },
        claimedDate: Date,
      },
    ],
    points: {
      type: Number,
      default: 0
    },
    pointsSpent: {
      type: Number,
      default: 0
    },
  },{strict: false, timestamps: true})
);

module.exports = Profile;
