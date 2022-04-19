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
        return res.json({ res: data });
      });
  } catch (err) {
    return res.json({ res: "Error in subscription retrival" });
  }
};

exports.update = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId });
    const price = await stripe.prices.create({
      unit_amount: parseInt(req.body.amount, 10) * 100,
      currency: "aud",
      recurring: { interval: req.body.interval },
      product: req.body.productId,
    });
    if (user.stripeSubscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(
        user.stripeSubscriptionId
      );
      const subscriptionTemp = await stripe.subscriptions.update(
        user.stripeSubscriptionId,
        {
          proration_behavior: "create_prorations",
          items: [{ id: subscription.items.data[0].id, price: price.id }],
          cancel_at_period_end: !req.body.renewal,
        }
      );
      if (subscriptionTemp)
        await User.findOneAndUpdate(
          { _id: req.userId },
          {
            stripeProductPrice: {
              productId: req.body.productId,
              priceId: price.id,
            },
            stripeSubscriptionId: subscriptionTemp.id,
          },
          { new: true },
          async (err, profile1) => {
            if (err) {
              return { message: err };
            }
            console.log("updation");
          }
        );
      return res.json({ res: "Subscription updated successfully" });
    } else {
      const subscriptionTemp = await stripe.subscriptions.create({
        customer: user.stripeCustomerId,
        items: [{ price: price.id }],
        cancel_at_period_end: !req.body.renewal,
      });
      if (subscriptionTemp)
        await User.findOneAndUpdate(
          { _id: req.userId },
          {
            stripeProductPrice: {
              productId: req.body.productId,
              priceId: price.id,
            },
            stripeSubscriptionId: subscriptionTemp.id,
          },
          { new: true },
          async (err, profile1) => {
            if (err) {
              return { message: err };
            }
            console.log("updation");
          }
        );
      return res.json({ res: "New Subscription created successfully" });
    }
  } catch (err) {
    console.log(err);
    return res.json({ res: "Subscription updated failed" });
  }
};

exports.invoices = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId });
    const invoices = await stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit: 3,
    });
    return res.json({ res: invoices });
  } catch (err) {
    return res.json({ res: "Invoice cant retrieved" });
  }
};
