const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet("1234567890abcdefghABCDEFGH", 10);
const config = require("../config/auth.config");
const db = require("../models");
const {sendMail} = require("../config/mailer")
const stripeConfig = require("../config/stripe.config");
const stripe = require("stripe")(stripeConfig.STRIPE_SECRET_KEY)
const User = db.user;
const Role = db.role;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  const pssword = nanoid()
  const renewal = req.body.renew;
  const productId = req.body.productId
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(pssword, 8),
    phone: req.body.phone
  });

  user.company ={
    name: req.body.companyName,
      phone: req.body.companyPhone,
      address: req.body.companyAddress,
      city: req.body.companyCity,
      state: req.body.companyState,
      zip: req.body.companyZip,
      country: req.body.companyCountry,
      website: req.body.companyWebsite,
  }

  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (req.body.roles) {
      Role.find(
        {
          name: { $in: req.body.roles }
        },
        async(err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          user.roles = roles.map(role => role._id);

          console.log("user creation stripe",renewal, productId);
          // prod_L0ZoffTtV9fd11FRee free
          
          const customer = await stripe.customers.create({
            name: req.body.username,
            email: req.body.email,
            phone: req.body.phone
          });
          user.stripeCustomerId = customer.id
          user.save(async(err) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }
            await sendMail(
              req.body.email,
              "Hydesq – New Account",null, `${req.body.email} pass: ${pssword} `,
              null
            );
            res.send({ message: "User was registered successfully!", stripeCustomerId: customer.id });
          });
        }
      );
    } else {
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        user.roles = [role._id];
        user.save(err => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          res.send({ message: "User was registered successfully!" });
        });
      });
    }
  });
};

exports.signin = (req, res) => {
  User.findOne({
    email: req.body.email
  })
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      var authorities = [];

      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }
      res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        roles: authorities,
        accessToken: token
      });
    });
};
