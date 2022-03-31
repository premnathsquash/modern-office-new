const mongoose = require("mongoose");

const Floor = mongoose.model(
  "Floor",
  new mongoose.Schema({
    name: String,
  })
);

module.exports = Floor;
