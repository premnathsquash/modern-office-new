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
      timeZone: {
        type: String,
        default: "Australia/Sydney"
      },
      desk: {
        date: Date,
        from: String,
        to: String,
        whole: Boolean,
        cancelled: {
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
