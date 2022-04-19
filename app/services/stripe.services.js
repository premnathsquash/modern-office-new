const db = require("../models");
const User = db.user;
exports.resetUserDb = async(id)=>{ 
  await User.findOneAndUpdate({stripeSubscriptionId: id}, {stripeProductPrice: null, stripeSubscriptionId: "" }, { new: true },async (err, profile1) => {
    if (err) {
      return { message: err };
    }
  //console.log("updation");
  
  })
  

}
