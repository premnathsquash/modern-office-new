const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("1234567890abcdefghijklmnABCDEFGHIJKLMN", 4);

const { sendMail } = require("../../config/mailer");
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
        { new: true },
        (err1, data1) => {
          if (err1) {
            res.status(500).send({ message: err1 });
            return;
          }
          return res
            .status(200)
            .send({
              username: `${data1.firstName} ${data1.lastName}`,
              email: data1.email,
              image: data1.dp,
            });
        }
      );
    });
  } catch (err) {
    return res.status(500).send({ res: "Something went wrong", error });
  }
};

exports.sendProfileEmailOtp = async (req, res) => {
  const otp = nanoid();
  try {
    await Profile.findOneAndUpdate(
      { _id: req.userId },
      { otp: otp },
      { new: true },
      async (err1, data1) => {
        if (err1) {
          res.status(500).send({ message: err1 });
          return;
        }
        await sendMail(
          req.body.email,
          "Hydesq – updated email",
          null,
          `${req.body.email} otp: ${otp}`,
          null
        );
      }
    );
    return res.status(200).send("Otp sent to provided mail");
  } catch (err) {
    return res.status(500).send({ res: "Something went wrong", error });
  }
};

exports.verifyProfileEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    await Profile.findOne({ _id: req.userId }, async (err, data) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      if (otp == data._doc.otp) {
        await Profile.findOneAndUpdate(
          { _id: req.userId },
          { email: email },
          (err1, data1) => {
            if (err1) {
              res.status(500).send({ message: err1 });
              return;
            }
          }
        );
        return res.status(200).send("Email updated successfully");
      } else {
        return res.status(200).send("Otp mismatch");
      }
    });
  } catch (err) {
    return res.status(500).send({ res: "Something went wrong", error });
  }
};
