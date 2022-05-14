const mongoose = require("mongoose");

const Notification = mongoose.model(
  "Notification",
  new mongoose.Schema(
    {
      setting: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { minimize: false, strict: false, timestamps: true }
  )
);

module.exports = Notification;
