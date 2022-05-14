const mongoose = require("mongoose");

const Notification = mongoose.model(
  "Notification",
  new mongoose.Schema(
    {
      email: {
        type: String,
      },
      deviceTokens: { type: mongoose.Schema.Types.Mixed, default: {} },
      notifications: [{ type: mongoose.Schema.Types.Mixed, default: {} }],
      setting: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { minimize: false, strict: false, timestamps: true }
  )
);

module.exports = Notification;
