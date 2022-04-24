const db = require("../../models");

const User = db.user;
const OfficeConfigure = db.officeConfigure;

exports.officeConfigureRead = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId });
    const officeConfigure1 = await OfficeConfigure.findOne({
      _id: user.officeConfigure,
    });
    return res.json(officeConfigure1);
  } catch (err) {
    return res.json({ res: "Error in read" });
  }
};

exports.officeConfigureUpdate = async (req, res) => {
  try {
    const body = { ...req.body };
    const user = await User.findOne({ _id: req.userId });
    const officeConfigure1 = await OfficeConfigure.findOne({
      _id: user.officeConfigure,
    });
    await OfficeConfigure.findOneAndUpdate(
      { _id: user.officeConfigure },
      body,
      (err, officeConfigure1) => {
        if (err) {
          return { message: err };
        }
        return res.json({ res: "update is done" });
      }
    );
  } catch (err) {
    return res.json({ res: "Error in update" });
  }
};
