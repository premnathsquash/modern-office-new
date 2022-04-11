const mongoose = require("mongoose");

const Floor = mongoose.model(
  "Floor",
  new mongoose.Schema({
    name: String,
    Seats: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seats",
    }
  },
  {
    timestamps: true
  })
);

module.exports = Floor;
