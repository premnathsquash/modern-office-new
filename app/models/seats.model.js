const mongoose = require("mongoose");

const Seats = mongoose.model(
  "Seats",
  new mongoose.Schema({
    seats: [{
      type: mongoose.Schema.Types.Mixed
    }],
    officeInfo: [{
      type: mongoose.Schema.Types.Mixed
    }],
  }, {strict: false})
);

module.exports = Seats;
