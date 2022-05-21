const mongoose = require("mongoose");

const Booking = mongoose.model(
  "Booking",
  new mongoose.Schema(
    {
      profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
      },
      company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      seatBook: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seats",
      },
      attendees: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Profile",
        },
      ],
      booked: Boolean,
      seat: String,
      seatType: String,
      timeZone: {
        type: String,
        default: "Australia/Sydney"
      },
      desk: {
        dateFrom: String,
        dateTo: String,
        fromTime: String,
        toTime: String,
        cancelled: {
          type: Boolean,
          default: false,
        },
        noShow: {
          type: Boolean,
          default: false,
        },
        approved: {
          type: Boolean,
          default: false,
        },
        booked:{
          type: Boolean,
          default: false,
        },
        standBy:{
          type: Boolean,
          default: false,
        },
        recurrence: String,
        recurrenceDays: [{
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        }]
      },
    },
    { minimize: false, timestamps: true, strict: false }
  )
);

module.exports = Booking;
