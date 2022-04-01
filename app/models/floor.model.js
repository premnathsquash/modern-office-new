const mongoose = require("mongoose");

const Floor = mongoose.model(
  "Floor",
  new mongoose.Schema({
    name: String,
    created_at: {type: Date, required: true, default: Date.now},
  })
);

module.exports = Floor;
