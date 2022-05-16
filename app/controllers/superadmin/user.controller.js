require("dotenv").config();
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("1234567890abcdefghijklmnABCDEFGHIJKLMN", 10);
const bcrypt = require("bcryptjs");

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
      const SuperUser = await User.findOne({ _id: process.env.adminId });
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
            dp: fileLocation ?? "",
            password: bcrypt.hashSync(pssword, 8),
            roles: mongoose.Types.ObjectId(roles[0]._id),
            meta: {
              admin: SuperUser.id,
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              status: true,
              lastlogin: "",
            },
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

    return res.send("Admin created successfully");
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};

exports.listAdmins = async (req, res) => {
  try {
    const users = await User.find({
      roles: mongoose.Types.ObjectId("623ae46a3c032b9d16c46a3f"),
    });
    const intermediate = users
      .map((el) => {
        if (el?.email != "info@greenuniverse.com") {
          return {
            id: el.id,
            dp: el?.dp ?? "",
            email: el.email,
            firstName: el?.meta?.firstName,
            lastName: el?.meta?.lastName,
            lastlogin: el?.meta?.lastlogin ?? "",
            status: el?.meta?.status,
          };
        }
      })
      .filter((el) => el);
    return res.send(intermediate);
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};

exports.updateAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, status } = req.body;
    let fileLocation;
    if (req.file) {
      const { location } = req.file;
      fileLocation = location;
    }
    let stw = status == "true" || status == true ? true : false;

    await User.findOne({ _id: id }, async (err, data) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      await User.findOneAndUpdate(
        { _id: data.id },
        {
          username: `${firstName ?? data.meta.firstName} ${
            lastName ?? data.meta.lastName
          }`,
          dp: fileLocation ?? data.dp,
          meta: {
            ...data.meta,
            firstName: firstName ?? data.meta.firstName,
            lastName: lastName ?? data.meta.lastName,
            status: stw ?? data.meta.status,
          },
        },
        (err1, data1) => {
          if (err1) {
            res.status(500).send({ message: err1 });
            return;
          }
          return res.send("Admin updated successfully");
        }
      );
    });
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};
exports.deleteeAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findOneAndRemove({ _id: id }, (err) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      return res.send("Admin deleted successfully");
    });
  } catch (error) {
    return res.status(500).send({ message: error });
  }
};
