const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("1234567890abcdefghijklmnABCDEFGHIJKLMN", 4);

const db = require("../../models");
const { sendMail } = require("../../config/mailer");
const Profile = db.profile;

exports.resetPassReq = async (req, res) => {
  try {
    const { email } = req.body;
    await Profile.findOne({ email: email }, async(err, data) => {
      if (err) {
        return res.status(500).send({ message: err });
      }
      await Profile.findOneAndUpdate({ email: email }, {otp: nanoid()}, (err1, data1)=>{
        if (err1) {
          return res.status(500).send({ message: err1 });
        }
      })
      await sendMail(
        req.body.email,
        "Hydesq – New Account",
        null,
        `${req.body.email} otp: ${nanoid()}`,
        null
      );
      res.status(200).send({ res: "Email has been sent to you" });
    });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
