const mongoose = require("mongoose");

const Attendance = mongoose.model(
  "Attendance",
  new mongoose.Schema({
    range: {
      type: String,
      enum : ['none','weekly', 'monthly'],
      default: 'weekly'
  },
    days: {
      type: Number,
      default: 0
    },
    workfromoffice: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  })
);

module.exports = Attendance;
