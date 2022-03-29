const { customAlphabet } = require("nanoid");
const { epochUtil } = require("epochutils");
const crypto = require("crypto");
const nanoid = customAlphabet("1234567890abcdefghABCDEFGH", 10);
const config = require("../config/auth.config");
const db = require("../models");
const { sendMail } = require("../config/mailer");
const stripeConfig = require("../config/stripe.config");

const stripe = require("stripe")(stripeConfig.STRIPE_SECRET_KEY);

const User = db.user;
const Role = db.role;
const Token = db.token;
const mongoose = db.mongoose;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const trailDate = epochUtil().addDay(14);

exports.signup = (req, res) => {
  const trialEnd = `${trailDate.getLocal()}`.substring(0, 10);
  const pssword = req.body.password || nanoid();
  const image = req.body.image
  const renewal = req.body.renew;
  const interval = req.body.interval;
  const productId = req.body.productId;
  const cardToken = req.body.cardToken;
  const role = req.body.role || "client";
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    image,
    password: bcrypt.hashSync(pssword, 8),
    phone: req.body.phone,
    job: req.body.job,
  });

  if (role === "admin") {
    Role.find(
      {
        name: { $in: role },
      },
      async (err, roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        user.roles = mongoose.Types.ObjectId(roles[0]._id);
        user.save(async (err) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          return res.send({
            message: "admin was registered successfully!",
          });
        });
      }
    );
  }

  if (role === "user") {
    user.slug = req.body.companyName;
    Role.find(
      {
        name: { $in: role },
      },
      async (err, roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        user.roles = mongoose.Types.ObjectId(roles[0]._id);
        user.save(async (err) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          await sendMail(
            req.body.email,
            "Hydesq – New Account",
            null,
            `${req.body.email} pass: ${pssword} slug: ${req.body.companyName}`,
            null
          );
          return res.send({
            message: "User was registered successfully!",
          });
        });
      }
    );
  }

  user.company = {
    name: req.body.companyName,
    phone: req.body.companyPhone,
    address: req.body.companyAddress,
    city: req.body.companyCity,
    state: req.body.companyState,
    zip: req.body.companyZip,
    country: req.body.companyCountry,
    website: req.body.companyWebsite,
  };

  Role.find(
    {
      name: { $in: role },
    },
    async (err, roles) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      user.roles = mongoose.Types.ObjectId(roles[0]._id);
      if (productId && cardToken && req.body.amount) {
        const customer = await stripe.customers.create({
          name: req.body.username,
          email: req.body.email,
          phone: req.body.phone,
        });

        await stripe.customers.createSource(customer.id, {
          source: cardToken,
        });
        const price = await stripe.prices.create({
          unit_amount: parseInt(req.body.amount, 10) * 100,
          currency: "aud",
          recurring: { interval: interval },
          product: productId,
        });
        await stripe.subscriptions.create({
          customer: customer.id,
          items: [{ price: price.id }],
          trial_end: trialEnd,
          cancel_at_period_end: !renewal,
        });
        user.trialEnd = trialEnd;
        user.stripeCustomerId = customer.id;
        user.stripeProductPrice.productId = productId;
        user.stripeProductPrice.priceId = price.id;
        user.save(async (err) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          await sendMail(
            req.body.email,
            "Hydesq – New Account",
            null,
            `${req.body.email} pass: ${pssword} `,
            null
          );
          return res.send({
            message: "client was registered successfully!",
            stripeCustomerId: customer.id,
          });
        });
      }
    }
  );
};

exports.signin = (req, res) => {
  User.findOne({
    email: req.body.email,
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

      const passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!",
        });
      }

      const token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400, // 24 hours
      });

      const authorities = user.roles.name.toUpperCase();

      res.status(200).send({
        id: user._id,
        name: user.username,
        email: user.email,
        role: authorities,
        token: token,
      });
    });
};

exports.resetPassReq = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(500).send({ message: "No user by this mail" });
  let token = await Token.findOne({ userId: user._id });
  if (token) await token.deleteOne();
  let resetToken = crypto.randomBytes(32).toString("hex");

  await new Token({
    userId: user._id,
    token: resetToken,
    createdAt: Date.now(),
  }).save();

  const link = `http://localhost:8080/auth/reset?id=${resetToken}`;

  await sendMail(user.email, "Hydesq –  Link", `Link ${link}`, `Link ${link}`, null);

  res.status(200).send({ res: "Email has been sent to you" });
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const passwordResetToken = await Token.findOne({ token: token });
  if (!passwordResetToken)
    return res
      .status(500)
      .send({ message: "Invalid or expired password reset token" });
  const hash = await bcrypt.hash(password, Number(10));
  await User.updateOne(
    { _id: passwordResetToken.userId },
    { $set: { password: hash } },
    { new: true }
  );
  await passwordResetToken.deleteOne();
  res.status(200).send({ res: "Password resetted successfully" });
};
