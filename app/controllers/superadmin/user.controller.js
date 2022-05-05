const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("1234567890abcdefghijklmnABCDEFGHIJKLMN", 10);
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const config = require("../../config/auth.config");
const db = require("../../models");
const { sendMail } = require("../../config/mailer");

const mongoose = db.mongoose;
const User = db.user;
const Role = db.role;

exports.createAdminUser = async (req, res) => {
  try {
    const role = "admin";
    let fileLocation;
    if (req.file) {
      const { location } = req.file;
      fileLocation = location;
    }
    const pssword = nanoid();
    await User.findOne({ _id: req.userId }, async (err, data) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      const SuperUser = await User.findOne({ _id: "6268f92820a41c3eaf08ad1a" });
      await Role.find(
        {
          name: { $in: role },
        },
        async (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          const user = new User({
            username: `${req.body.firstName} ${req.body.lastName}`,
            email: req.body.email,
            dp: fileLocation,
            password: bcrypt.hashSync(pssword, 8),
            roles: mongoose.Types.ObjectId(roles[0]._id),
            meta: { admin: SuperUser.id, firstName: req.body.firstName, lastName: req.body.lastName },
          });
          user.save(async (err1, result) => {
            if (err1) {
              res.status(500).send({ message: err1 });
              return;
            }
            await sendMail(
              req.body.email,
              "Hydesq – New Admin Account",
              null,
              `${req.body.email} pass: ${pssword}`,
              null
            );
          });
        }
      );
    });

    return res.send("data1");
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};

