const mongoose = require("mongoose");

const Department = mongoose.model(
  "Department",
  new mongoose.Schema({
    departments: String,
    status: {
      type: Boolean,
      default: true
    },
    users: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
  }
  })
);

module.exports = Department;
