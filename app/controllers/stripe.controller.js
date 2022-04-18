const db = require("../models");
const stripeConfig = require("../config/stripe.config");

const stripe = require("stripe")(stripeConfig.STRIPE_SECRET_KEY);

const User = db.user;

exports.cancel = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId });

    await stripe.subscriptions
      .del(user.stripeSubscriptionId)
      .then(() => res.json({ res: "subscription cancelled" }));
  } catch (err) {
    return res.json({ res: "Error in subscription cancelation" });
  }
};

exports.retrive = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId });

    await stripe.subscriptions
      .retrieve(user.stripeSubscriptionId)
      .then((data) => {
        console.log(data);
        return res.json({ res: "subscription cancelled" })
      });
  } catch (err) {
    return res.json({ res: "Error in subscription cancelation" });
  }
};


