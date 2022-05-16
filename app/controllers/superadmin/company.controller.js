require("dotenv").config();
const { epochUtil } = require("epochutils");
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("1234567890abcdefghijklmnABCDEFGHIJKLMN", 10);
const bcrypt = require("bcryptjs");

const { sendMail } = require("../../config/mailer");
const stripeConfig = require("../../config/stripe.config");
const stripe = require("stripe")(stripeConfig.STRIPE_SECRET_KEY);

const db = require("../../models");
const User = db.user;
const Profile = db.profile;
const OfficeConfigure = db.officeConfigure;
const Departments = db.departments;
const Role = db.role;
const mongoose = db.mongoose;

const trailDate = epochUtil().addDay(14);

exports.getAllCompanies = async (req, res) => {
  let admin = await User.findOne({
    _id: process.env.adminId,
  });
  let companies = admin._doc.connection.map(async (ele) => {
    const admin1 = await User.findOne(
      {
        _id: ele,
      },
      (err, doc) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
      }
    );

    return admin1;
  });

  Promise.all(companies).then((data) => {
    return res.status(200).send(data);
  });
};

exports.createCompany = async (req, res) => {
  const trialEnd = `${trailDate.getLocal()}`.substring(0, 10);
  const role = "client";
  const password = nanoid();
  const productId = req.body?.productId;
  const renewal = req.body?.renew;
  const interval = req.body?.interval;
  let maxCapacity = req.body?.maxCapacity;
  let minCapacity = req.body?.minCapacity;
  const officeConfigure = new OfficeConfigure({});
  let company_image, profile_image;
  if (req.files) {
    const [image, image2] = req.files;
    company_image = image;
    profile_image = image2;
  }
  switch (productId) {
    case "prod_LLhE8XyggI9emW":
    case "prod_LLhDgrkCb3iMdY":
      minCapacity = 50;
      maxCapacity = 100;
      break;
    case "prod_LLhC9Mi443YJ87":
    case "prod_LLhB9GC3dIcFJh":
      minCapacity = 21;
      maxCapacity = 50;
      break;
    case "prod_LLhBtcAFb3UKTj":
    case "prod_LLhApE4wTig88P":
      minCapacity = 11;
      maxCapacity = 20;
      break;
    case "prod_LLh91siLUTHKza":
    case "prod_LLh8yhbpznJKzL":
      minCapacity = 1;
      maxCapacity = 10;
      break;
  }
  try {
    officeConfigure.save(async (err, dataofficeConfigure) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      const user = new User({
        username: req.body.username,
        email: req.body.email,
        dp: company_image?.location ?? "",
        password: bcrypt.hashSync(password, 8),
        phone: req.body.phone,
        job: req.body.job,
        minSeat: minCapacity,
        maxSeat: maxCapacity,
        slug: req.body.companyName,
        officeConfigure: dataofficeConfigure.id,
        company: {
          name: req.body.companyName,
          companyImg: profile_image?.location ?? "",
          phone: req.body.companyPhone,
          address: req.body.companyAddress,
          city: req.body.companyCity,
          state: req.body.companyState,
          zip: req.body.companyZip,
          country: req.body.companyCountry,
          website: req.body.companyWebsite,
        },
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
          user.roles = mongoose.Types.ObjectId(roles[0]._id);
          const customer = await stripe.customers.create({
            name: req.body.username,
            email: req.body.email,
            phone: req.body.phone,
          });

          const price = await stripe.prices.create({
            unit_amount: parseInt(req.body?.amount ?? 0, 10) * 100,
            currency: "aud",
            recurring: { interval: interval },
            product: productId,
          });

          const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: price.id }],
            trial_end: trialEnd,
            cancel_at_period_end: !renewal,
          });
          user.stripeSubscriptionId = subscription.id;
          user.trialEnd = trialEnd;
          user.stripeCustomerId = customer.id;
          user.stripeProductPrice.productId = productId;
          user.stripeProductPrice.priceId = price.id;
          user.save(async (err1, dataValue) => {
            if (err1) {
              res.status(500).send({ message: err1 });
              return;
            }
            const admin = await User.findOne({
              _id: process.env.adminId,
            });
            await User.findOneAndUpdate(
              { _id: process.env.adminId },
              { connection: [...admin._doc.connection, dataValue._id] },
              (err1, newData) => {
                if (err1) {
                  res.status(500).send({ message: err1 });
                  return;
                }
              }
            );
            await sendMail(
              req.body.email,
              "Hydesq – New Account",
              null,
              `${req.body.email} pass: ${password} `,
              null
            );
            return res.status(200).send("client created successfully");
          });
        }
      );
    });
  } catch (err) {
    return res.status(500).send({ res: "Something went wrong", err });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const productId = "prod_LdyI3fFr4Nm7qT";
    const price = await stripe.prices.create({
      unit_amount: parseInt(req.body?.amount ?? 0, 10) * 100,
      currency: "aud",
      recurring: { interval: req.body?.interval },
      product: productId,
    });

    await User.findOne({ _id: req.params.id }, async (err, data) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      await User.findOneAndUpdate(
        { _id: req.params.id },
        {
          stripeProductPrice: { productId: productId, priceId: price.id },
          maxSeat: req.body?.seat,
        },
        (err1, data1) => {
          if (err1) {
            res.status(500).send({ message: err1 });
            return;
          }
        }
      );

      const subscription = await stripe.subscriptions.retrieve(
        data.stripeSubscriptionId
      );
      const subscriptionTemp = await stripe.subscriptions.update(
        data.stripeSubscriptionId,
        {
          proration_behavior: "create_prorations",
          items: [{ id: subscription.items.data[0].id, price: price.id }],
          cancel_at_period_end: !req.body.renewal,
        }
      );
      await User.findOneAndUpdate(
        { _id: req.params.id },
        { stripeSubscriptionId: subscriptionTemp.id },
        (err2, data2) => {
          if (err2) {
            res.status(500).send({ message: err2 });
            return;
          }
        }
      );
      return res.status(200).send("client updated successfully");
    });
  } catch (error) {
    return res.status(500).send({ res: "Something went wrong", error });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    user.profile.map(async (ele) => {
      await Profile.findOneAndRemove({ _id: ele });
    });
    user.departments.map(async (ele)=>{
      await Departments.findOneAndRemove({ _id: ele });
    })
    await OfficeConfigure.findOneAndRemove({ _id: user.officeConfigure });
    const user1 = await User.findOne({ _id: process.env.adminId });
    const newArr = user1._doc.connection.filter((ele) => ele != req.params.id);
    await stripe.subscriptions.del(user.stripeSubscriptionId).then(async () => {
      await User.findOneAndRemove({ _id: req.params.id }, async (err) => {
        await User.findOneAndUpdate(
          { _id: process.env.adminId },
          { connection: [...newArr] },
          (err1, newData) => {
            if (err1) {
              res.status(500).send({ message: err1 });
              return;
            }
          }
        );
      });
      return res.json({ res: "deleted successfully" });
    });
  } catch (err) {
    return res.json({ res: "Error in subscription cancelation" });
  }
};
