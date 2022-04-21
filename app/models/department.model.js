const mongoose = require("mongoose");

const Department = mongoose.model(
  "Department",
  new mongoose.Schema({
    name: String,
    status: {
      type: Boolean,
      default: true
    },
    members: {
      type: Number,
      default: 0
    },
    
  })
);

module.exports = Department;
