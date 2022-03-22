const stripeConfig = require("../config/stripe.config");
const stripe = require("stripe")(stripeConfig.STRIPE_SECRET_KEY)

exports.getplans = async(req, res) => {

  const products = await stripe.products.list();
  console.log(products)
  const intermidiate = [
    {
      id: "prod_L0ZoffTtV9fd11",
      object: "product",
      active: true,
      attributes: [],
      created: 1647659304,
      description: null,
      images: [],
      livemode: false,
      metadata: {},
      name: "free",
      package_dimensions: null,
      shippable: null,
      statement_descriptor: null,
      tax_code: "txcd_10000000",
      type: "service",
      unit_label: null,
      updated: 1647659304,
      url: null,
    },
    ...products.data
  ];
  res.status(200).send([...intermidiate]);
};
