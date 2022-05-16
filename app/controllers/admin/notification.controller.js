const db = require("../../models");
const User = db.user;
const Profile = db.profile;
const Notifications = db.notifications;

exports.updateNotification = async (req, res) => {
  try {
    const {
      floorPlanNotification50,
      floorPlanNotification80,
      floorPlanNotification100,
      profileNotificationUpdateName,
      profileNotificationUpdateEmail,
      pushNotifications,
      emailNotifications,
    } = req.body;
    const companyNotification = await User.findOne({
      _id: req.userId,
    }).populate({ path: "notification" });

    await Notifications.findOneAndUpdate(
      { _id: companyNotification.notification.id },
      {
        floorPlanNotification50:
          floorPlanNotification50 ??
          companyNotification?.notification.floorPlanNotification50,
        floorPlanNotification80:
          floorPlanNotification80 ??
          companyNotification?.notification.floorPlanNotification80,
        floorPlanNotification100:
          floorPlanNotification100 ??
          companyNotification?.notification.floorPlanNotification100,
        profileNotificationUpdateName:
          profileNotificationUpdateName ??
          companyNotification?.notification.profileNotificationUpdateName,
        profileNotificationUpdateEmail:
          profileNotificationUpdateEmail ??
          companyNotification?.notification.profileNotificationUpdateEmail,
        pushNotifications:
          pushNotifications ??
          companyNotification?.notification.pushNotifications,
        emailNotifications:
          emailNotifications ??
          companyNotification?.notification.emailNotifications,
      },
      { new: true },
      async (err, data) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        const profiles = await User.findOne({
          _id: req.userId,
        }).populate({ path: "profile" });
        profiles.profile.map(async (ele) => {
          await Profile.findOneAndUpdate(
            { _id: ele._id },
            {
              emailNotification: emailNotifications ?? ele.emailNotification,
              mobileNotification: pushNotifications ?? ele.mobileNotification,
            },
            { new: true },
            (err11, data11) => {
              if (err11) {
                res.status(500).send({ message: err11 });
                return;
              }
            }
          );
        });
        return res.status(200).send("Updated successfuly");
      }
    );
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
      floorPlanNotification50:
        companyNotification?.notification.floorPlanNotification50,
      floorPlanNotification80:
        companyNotification?.notification.floorPlanNotification80,
      floorPlanNotification100:
        companyNotification?.notification.floorPlanNotification100,
      profileNotificationUpdateName:
        companyNotification?.notification.profileNotificationUpdateName,
      profileNotificationUpdateEmail:
        companyNotification?.notification.profileNotificationUpdateEmail,
      pushNotifications: companyNotification?.notification.pushNotifications,
      emailNotifications: companyNotification?.notification.emailNotifications,
    };
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
