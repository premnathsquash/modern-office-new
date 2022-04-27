const mongoose = require("mongoose");

const Seats = mongoose.model(
  "Seats",
  new mongoose.Schema(
    {
      seats: [{
        type: mongoose.Schema.Types.Mixed,
      }],
      officeInfo: [{
        type: mongoose.Schema.Types.Mixed,
      }],
      booked: {
        timesBooked: { type: Boolean, default: false },
        available: { type: Boolean, default: true },
      },
    },
    { strict: false }
  )
);

module.exports = Seats;
