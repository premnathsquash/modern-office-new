const stripeConfig = require("../config/stripe.config");
const stripe = require("stripe")(stripeConfig.STRIPE_SECRET_KEY)

exports.getplans = async(req, res) => {
  const products = await stripe.products.list();
  const intermidiate = [
    {
      id: "prod_L0ZoffTtV9fd11FRee",
      object: "product",
      active: true,
      name: "free",
      type: "service",
      updated: 1647659304,
      url: null,
    },
    ...products.data
  ];
  res.status(200).send([...intermidiate]);
};
