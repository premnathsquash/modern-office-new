const mongoose = require("mongoose");

const Notification = mongoose.model(
  "Notification",
  new mongoose.Schema(
    {
      floorPlanNotification50: {type: Boolean,
        default: false, },
      floorPlanNotification80: {type: Boolean,
        default: false, },
      floorPlanNotification100: {type: Boolean,
        default: false, },
      profileNotificationUpdateName: {type: Boolean,
        default: false, },
      profileNotificationUpdateEmail: {type: Boolean,
        default: false, },
      pushNotifications: { type: Boolean,
        default: false,},
      emailNotifications: { type: Boolean,
        default: false, },
    },
    { minimize: false, strict: false, timestamps: true }
  )
);

module.exports = Notification;
