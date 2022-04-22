const stripeConfig = require("../../config/stripe.config");
const stripe = require("stripe")(stripeConfig.STRIPE_SECRET_KEY)

exports.getplans = async(req, res) => {
  const products = await stripe.products.list();
  const temp = products.data.map(ele=>{
    if(ele.id=="prod_LLhE8XyggI9emW"){
      return {
        id: ele.id,
        name: "Large Yearly",
        price: 5000
      }
    }
    if(ele.id=="prod_LLhDgrkCb3iMdY"){
      return {
        id: ele.id,
        name: "Large Month",
        price: 500
      }
    }
    if(ele.id=="prod_LLhC9Mi443YJ87"){
      return {
        id: ele.id,
        name: "Medium Yearly",
        price: 2000
      }
    }
    if(ele.id=="prod_LLhB9GC3dIcFJh"){
      return {
        id: ele.id,
        name: "Medium Month",
        price: 200
      }
    }
    if(ele.id=="prod_LLhBtcAFb3UKTj"){

      return {
        id: ele.id,
        name: "Small Yearly",
        price: 1000
      }

    }
    if(ele.id=="prod_LLhApE4wTig88P"){
      return {
        id: ele.id,
        name: "Small Month",
        price: 100
      }

    }
    if(ele.id=="prod_LLh91siLUTHKza"){
      return {
        id: ele.id,
        name: "Micro Yearly",
        price: 750
      }
    }
    if(ele.id=="prod_LLh8yhbpznJKzL"){
      return {
        id: ele.id,
        name: "Micro Month",
        price: 75
      }

    }
  })
  const intermidiate = [
    ...temp
  ];

  res.status(200).send([...intermidiate]);
};
