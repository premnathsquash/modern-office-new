const db = require("../models");
const stripeConfig = require("../config/stripe.config");

const stripe = require("stripe")(stripeConfig.STRIPE_SECRET_KEY);

const User = db.user;

exports.cancel = async(req, res) => {
const user = await User.findOne({ _id: req.userId })
const customer = await stripe.subscriptions.del(user.stripeCustomerId)
return res.json({"res":"c"})
}