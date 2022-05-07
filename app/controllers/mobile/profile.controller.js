const db = require("../../models");
const Profile = db.profile;

exports.updateProfileImage = async (req, res) => {
  try {
    let fileLocation;
    if (req.file) {
      const { location } = req.file;
      fileLocation = location;
    }
    await Profile.findOne({ _id: req.userId }, async (err, data) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      await Profile.findOneAndUpdate(
        { _id: req.userId },
        { dp: fileLocation ?? "" },
        {new: true},
        (err1, data1) => {
          if (err1) {
            res.status(500).send({ message: err1 });
            return;
          }
          return res.status(200).send({username: `${data1.firstName} ${data1.lastName}`, email: data1.email,  image: data1.dp});
        }
      );
    });

    
  } catch (err) {
    return res.status(500).send({ res: "Something went wrong", error });
  }
};
exports.sendProfileEmailOtp = async (req, res) => {
  try {
    console.log(req.userId);

    return res.status(200).send("client updated successfully");
  } catch (err) {
    return res.status(500).send({ res: "Something went wrong", error });
  }
};
exports.verifyProfileEmailOtp = async (req, res) => {
  try {
    console.log(req.userId);

    return res.status(200).send("client updated successfully");
  } catch (err) {
    return res.status(500).send({ res: "Something went wrong", error });
  }
};
