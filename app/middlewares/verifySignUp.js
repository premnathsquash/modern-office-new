const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;
const Profile = db.profile;

checkDuplicateUsernameOrEmail = (req, res, next) => {
  // Username
  User.findOne({
    email: req.body.email
  }).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (user) {
      res.status(400).send({ message: "Failed! Email is already in use!" });
      return;
    }
    // slug
    User.findOne({
      slug: req.body.companyName
    }).exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      } 
      if (user?.slug) {
        res.status(400).send({ message: "Failed! company is already in use!" });
        return;
      }

      next();
    });
  });
};
checkDuplicateProfilenameOrEmail = (req, res, next) => {
  // Username
  Profile.findOne({
    email: req.body.email
  }).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (user) {
      res.status(400).send({ message: "Failed! Email is already in use!" });
      return;
    }
    next();
  });
};

checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).send({
          message: `Failed! Role ${req.body.roles[i]} does not exist!`
        });
        return;
      }
    }
  }

  next();
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail,
  checkDuplicateProfilenameOrEmail,
  checkRolesExisted
};

module.exports = verifySignUp;
