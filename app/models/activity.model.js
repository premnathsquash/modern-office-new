const mongoose = require("mongoose");

const Activity = mongoose.model(
  "Activity",
  new mongoose.Schema(
    {
      userId: {type : String , unique : true},
      companyId: {type : String },
      email: {
        type: String,
      },
      deviceTokens: { type: mongoose.Schema.Types.Mixed, default: {} },
      notifications: [{ type: mongoose.Schema.Types.Mixed, default: {} }],
    },
    { minimize: false, strict: false, timestamps: true }
  )
);

module.exports = Activity;
