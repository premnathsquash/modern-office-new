const mongoose = require("mongoose");

const Booking = mongoose.model(
  "Booking",
  new mongoose.Schema({
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    },
    seatBook:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seats",
    },
    seat: String,
    officeInfo: String,
    booked: String,
    desk:{
      date: String,
      from: String,
      to: String,
      whole: String,
      cancelled: String,
      planWeek: String,
    },
    conference:{
      date: String,
      from: String,
      to: String,
      whole: String,
      cancelled: String,
      timeframe: String,
      teammember: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
      }]

    }
  },{minimize: false, timestamps: true, strict: false})
);

module.exports = Booking;
