const { customAlphabet } = require("nanoid");
const bcrypt = require("bcryptjs");

const nanoid = customAlphabet("1234567890abcdefghijklmnABCDEFGHIJKLMN", 4);
const nanoid1 = customAlphabet("1234567890abcdefghijklmnABCDEFGHIJKLMN", 10);

const db = require("../../models");
const { sendMail } = require("../../config/mailer");
const Profile = db.profile;

exports.resetPassReq = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = nanoid();
    await Profile.findOne({ email: email }, async (err, data) => {
      if (err) {
        return res.status(500).send({ message: err });
      }
      await Profile.findOneAndUpdate(
        { email: email },
        { otp: otp },
        (err1, data1) => {
          if (err1) {
            return res.status(500).send({ message: err1 });
          }
        }
      );
      await sendMail(
        req.body.email,
        "Hydesq – New Account",
        null,
        `${req.body.email} otp: ${otp}`,
        null
      );
      res.status(200).send({ res: "Email has been sent to you" });
    });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};

exports.checkOtp = async (req, res) => {
  try {
    const password1 = nanoid1();
    const { otp, email } = req.body;
    await Profile.findOne({ email: email }, async (err, data) => {
      if (err) {
        return res.status(500).send({ message: err });
      }

      if (data._doc.otp === otp) {
        await Profile.findOneAndUpdate(
          { email: email },
          { password: bcrypt.hashSync(password1, 8) },
          async (err1, data1) => {
            if (err1) {
              return res.status(500).send({ message: err1 });
            }
            await sendMail(
              data._doc.email,
              "Hydesq – reset Account",
              null,
              `${data._doc.email} pass: ${password1} slug: ${data._doc.slug}`,
              null
            );
          }
        );

        return res.status(200).send({ res: "Email has been sent to you" });
      } else {
        return res.status(200).send({ res: "Otp not matched" });
      }
    });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const {onLeave, emailNotification, mobileNotification, darkMode} = req.body
    await Profile.findOne({ _id: req.userId }, async (err, data) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      await Profile.findOneAndUpdate(
        { _id: req.userId },
        { onLeave: onLeave ?? data.onLeave,  emailNotification: emailNotification ?? data.emailNotification, mobileNotification: mobileNotification ?? data.mobileNotification, darkMode: darkMode ?? data.darkMode},
        { new: true },
        (err1, data1) => {
          if (err1) {
            res.status(500).send({ message: err1 });
            return;
          }
        }
      );
      return res.status(200).send({ res: "Update is successful" });
    });
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};
