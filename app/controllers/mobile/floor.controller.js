const db = require("../../models");

exports.mobileFloorDisplay = async (req, res) => {
  try {
    const userid = req.userId
    return res.status(200).send({ res: "Email has been sent to you" });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
