const mongoose = require("mongoose");

const Floor = mongoose.model(
  "Floor",
  new mongoose.Schema({
    slug: String,
    officeName: String,
  })
);

module.exports = Floor;
