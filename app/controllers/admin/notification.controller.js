const db = require("../../models");
const User = db.user;

exports.updateNotification = async (req, res) => {
  try {
const companyNotification = await User.findOne({_id: req.userId}).populate({path: "notification"})
  } catch (error) {}
};

exports.getNotification = async (req, res) => {
  try {
const companyNotification = await User.findOne({_id: req.userId}).populate({path: "notification"})
  } catch (error) {}
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
