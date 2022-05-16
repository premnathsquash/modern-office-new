const db = require("../../models");
const User = db.user;
const Notifications = db.notifications;

exports.updateNotification = async (req, res) => {
  try {
    const companyNotification = await User.findOne({
      _id: req.userId,
    }).populate({ path: "notification" });

  
    console.log(companyNotification);
    
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};

exports.getNotification = async (req, res) => {
  try {
    const companyNotification = await User.findOne({
      _id: req.userId,
    }).populate({ path: "notification" });
    const result = {
      id: companyNotification?.notification.id,
      floorPlanNotification50: companyNotification?.notification.floorPlanNotification50,
      floorPlanNotification80: companyNotification?.notification.floorPlanNotification80,
      floorPlanNotification100: companyNotification?.notification.floorPlanNotification100,
      profileNotificationUpdateName: companyNotification?.notification.profileNotificationUpdateName,
      profileNotificationUpdateEmail: companyNotification?.notification.profileNotificationUpdateEmail,
      pushNotifications: companyNotification?.notification.pushNotifications,
      emailNotifications: companyNotification?.notification.emailNotifications,
    }
    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};

exports.check = async (ws, req) => {
  try {
    ws.on("message", (msg) => {
      console.log("message send");
      ws.send(msg);
    });
    ws.on("close", () => {
      console.log("WebSocket was closed");
    });
  } catch (error) {
    ws.on("close", () => {
      console.log("WebSocket has problem");
    });
  }
};
