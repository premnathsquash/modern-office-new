const db = require("../../models");
const Profile = db.profile
exports.mobileFloorDisplay = async (req, res) => {
  try {
    const userProfile = await Profile.findOne({_id: req.userId})
    console.log(userProfile);
    
    return res.status(200).send({ res: "Email has been sent to you" });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
