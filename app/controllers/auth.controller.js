const { customAlphabet } = require("nanoid");
const { epochUtil } = require("epochutils");
const crypto = require("crypto");
const nanoid = customAlphabet("1234567890abcdefghijklmnABCDEFGHIJKLMN", 10);
const config = require("../config/auth.config");
const db = require("../models");
const { sendMail } = require("../config/mailer");
const stripeConfig = require("../config/stripe.config");

const stripe = require("stripe")(stripeConfig.STRIPE_SECRET_KEY);

const User = db.user;
const Profile = db.profile;
const Role = db.role;
const Token = db.token;
const mongoose = db.mongoose;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const trailDate = epochUtil().addDay(14);

exports.signup = (req, res) => {
  const trialEnd = `${trailDate.getLocal()}`.substring(0, 10);
  const pssword = req.body.password || nanoid();
  const renewal = req.body.renew;
  const interval = req.body.interval;
  const productId = req.body.productId;
  const cardToken = req.body.cardToken;
  const role = req.body.role || "client";
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    dp: "",
    password: bcrypt.hashSync(pssword, 8),
    phone: req.body.phone,
    job: req.body.job,
  });
  user.slug = req.body.companyName;
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
    companyImg: "",
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
        slug: user.slug,
        token: token,
      });
    });
};

exports.userSignup = async (req, res) => {
  const pssword = nanoid();
  const role = "user";
  const company = await User.findOne({ _id: req.userId });
  const { location } = req.file;
  const status = true;
  const {
    firstName,
    lastName,
    email,
    department,
    allocatedDesk,
    reservedSeats,
    makeAdmin,
  } = req.body;
  const profile = new Profile({
    firstName,
    lastName,
    password: bcrypt.hashSync(pssword, 8),
    dp: location ?? "",
    email,
    department,
    allocatedDesk,
    reservedSeats,
    makeAdmin,
  });
  Role.find(
    {
      name: { $in: role },
    },
    async (err, roles) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      profile.roles = mongoose.Types.ObjectId(roles[0]._id);
      profile.status = status;
      profile.slug = company.slug;
      profile.save(async (err, result) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        await User.findOneAndUpdate(
          { _id: company._id },
          { profile: [result._id, ...company.profile] },
          async (err, profile1) => {
            if (err) {
              return { message: err };
            }
            await sendMail(
              req.body.email,
              "Hydesq – New User Account",
              null,
              `${email} pass: ${pssword} companySlug: ${company.slug}`,
              null
            );
          }
        );
      });
    }
  );
  return res.status(200).send({ res: "user sign-up successfuly" });
};

exports.userLoginIn = async (req, res) => {
  if (!req.body.email)
    return res.status(400).end({ res: "please provide email" });
  if (!req.body.slug)
    return res.status(400).end({ res: "please provide slug" });
  Profile.findOne({
    email: req.body.email,
    slug: req.body.slug,
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
    });
  return res.status(200).send({
    id: user._id,
    name: user.username,
    email: user.email,
    role: authorities,
    slug: user.slug,
    token: token,
  });
};

exports.getProfile = async (req, res) => {
  const user = await User.findOne({ _id: req.userId });
  const {
    company: {
      name: companyName,
      companyImg,
      address: companyAddress,
      city: companyCity,
      state: companyState,
      zip: companyZip,
      country: companyCountry,
    },
    username,
    email,
    dp,
  } = user;
  return res.status(200).send({
    companyName,
    companyImg,
    companyAddress,
    companyCity,
    companyState,
    companyZip,
    companyCountry,
    username,
    email,
    dp,
  });
};

exports.searchEmail = async (req, res) => {
  try {
    if (!req.query.email)
      return res.status(406).send("Please provide an email to verify.");
    const user = await Profile.findOne({ email: req.query.email });
    if (user) return res.status(400).send("Email Id already taken.");
    else return res.status(200).send("Email available.");
  } catch (err) {
    return res
      .status(500)
      .send({ message: "servrer not responding due to error" });
  }
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

  await sendMail(
    user.email,
    "Hydesq –  Link",
    `Link ${link}`,
    `Link ${link}`,
    null
  );

  res.status(200).send({ res: "Email has been sent to you" });
};

exports.resetPasswordInternal = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findOne({ _id: req.userId });
  if (!user && !user.password)
    return res.status(500).send({ res: "Something went wrong" });
  const passVerification = await bcrypt.compareSync(oldPassword, user.password);
  if (!passVerification)
    return res.status(500).send("Current password does not match.");
  await User.findOneAndUpdate(
    { _id: req.userId },
    {
      password: bcrypt.hashSync(newPassword, 8),
    }
  )
    .then(async () => {
      await sendMail(
        user.email,
        "Hydesq – Password upgrade",
        null,
        `${user.email} password has been updated successfully`,
        null
      );
    })
    .catch((err) => {
      return res.status(500).send({ res: "Something went wrong" });
    });
  res.status(200).send({ res: "Password resetted successfully" });
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

exports.updateProfile = async (req, res) => {
  const user = await User.findOne({ _id: req.userId });
  const {
    username,
    email,
    companyName,
    companyAddress,
    companyCity,
    companyState,
    companyZip,
    companyCountry,
  } = req.body;
  
  const [image, image2] = req.file;
  console.log(req.body, req.file);

  try {
    let doc = await User.findOneAndUpdate(
      { _id: user._id },
      {
        username: username ?? user.username,
        email: email ?? user.email,
        dp: image.location ?? user.dp,
        company: {
          name: companyName ?? user.company.name,
          companyImg: image2.location ?? user.company.companyImg,
          address: companyAddress ?? user.company.address,
          city: companyCity ?? user.company.city,
          state: companyState ?? user.company.state,
          zip: companyZip ?? user.company.zip,
          country: companyCountry ?? user.company.country,
        },
      },
      {
        new: true,
      }
    );
    return res.status(200).send("updated successfully");
  } catch (err) {
    return res.status(500).send({ res: "Something went wrong", err });
  }
};

exports.getAllProfileusers = async (req, res) => {
  const user = await User.findOne({ _id: req.userId });
  await Profile.find({ slug: user.slug }).then().c;
};

exports.getProfileUser = async (req, res) => {};

exports.logout = async (req, res) => {
  const token = req.headers["x-auth-token"];
  if (!token) return res.status(400).send({ res: "User not logged" });
  res.status(200).send({ res: "user logout successfully" });
};
